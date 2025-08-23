const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();

// 환경변수 설정
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'dache.db');

// Google Sheets 설정
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';
const ENABLE_GOOGLE_SHEETS = process.env.ENABLE_GOOGLE_SHEETS === 'true';

// 로깅 설정
const logFile = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    console.log(logMessage.trim());
    logStream.write(logMessage);
}

// Google Sheets로 데이터 전송하는 함수
async function sendToGoogleSheets(data) {
    if (!ENABLE_GOOGLE_SHEETS || !GOOGLE_SHEETS_WEBHOOK_URL) {
        log('Google Sheets integration is disabled or URL not configured', 'INFO');
        return { success: false, message: 'Google Sheets integration not configured' };
    }

    return new Promise((resolve) => {
        const postData = JSON.stringify(data);
        
        const url = new URL(GOOGLE_SHEETS_WEBHOOK_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    log(`Google Sheets response: ${JSON.stringify(response)}`, 'INFO');
                    resolve(response);
                } catch (error) {
                    log(`Error parsing Google Sheets response: ${error.message}`, 'ERROR');
                    resolve({ success: false, message: 'Invalid response from Google Sheets' });
                }
            });
        });

        req.on('error', (error) => {
            log(`Error sending to Google Sheets: ${error.message}`, 'ERROR');
            resolve({ success: false, message: `Network error: ${error.message}` });
        });

        req.write(postData);
        req.end();
    });
}

// 미들웨어 설정
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 제공 (온라인 환경 고려)
app.use(express.static(path.join(__dirname)));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
    log(`${req.method} ${req.path} - ${req.ip}`, 'REQUEST');
    next();
});

// SQLite 데이터베이스 설정
let db;

function initDatabase() {
    // 데이터베이스 디렉토리 확인 및 생성
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        log(`데이터베이스 디렉토리 생성: ${dbDir}`);
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            log(`데이터베이스 연결 오류: ${err.message}`, 'ERROR');
            // 재시도 로직
            setTimeout(initDatabase, 5000);
            return;
        }
        
        log(`SQLite 데이터베이스에 연결되었습니다: ${DB_PATH}`);
        createTables();
    });

    // 데이터베이스 연결 오류 처리
    db.on('error', (err) => {
        log(`데이터베이스 오류: ${err.message}`, 'ERROR');
        // 연결 재시도
        setTimeout(initDatabase, 5000);
    });
}

// 테이블 생성
function createTables() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS contact_inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            birthdate TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            gender TEXT NOT NULL,
            education TEXT NOT NULL,
            region TEXT NOT NULL,
            occupation TEXT NOT NULL,
            income TEXT NOT NULL,
            meeting1 TEXT NOT NULL,
            meeting2 TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            ip_address TEXT,
            user_agent TEXT
        )
    `;
    
    db.run(createTableQuery, (err) => {
        if (err) {
            log(`테이블 생성 오류: ${err.message}`, 'ERROR');
        } else {
            log('contact_inquiries 테이블이 생성되었습니다.');
        }
    });
}

// 데이터베이스 연결 확인
function checkDatabaseConnection() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('데이터베이스가 연결되지 않았습니다.'));
            return;
        }
        
        db.get('SELECT 1', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// API 라우트

// 1. 문의 등록 API
app.post('/api/contact', async (req, res) => {
    try {
        // 데이터베이스 연결 확인
        await checkDatabaseConnection();
        
        const {
            name, birthdate, phone, email, gender, education, 
            region, occupation, income, meeting1, meeting2
        } = req.body;
        
        // 필수 필드 검증
        if (!name || !birthdate || !phone || !email || !gender || 
            !education || !region || !occupation || !income || !meeting1) {
            log(`문의 등록 실패 - 필수 필드 누락: ${JSON.stringify(req.body)}`, 'WARN');
            return res.status(400).json({
                success: false,
                message: '필수 항목을 모두 입력해주세요.'
            });
        }
        
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '올바른 이메일 형식을 입력해주세요.'
            });
        }
        
        const insertQuery = `
            INSERT INTO contact_inquiries 
            (name, birthdate, phone, email, gender, education, region, occupation, income, meeting1, meeting2, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            name, birthdate, phone, email, gender, education, 
            region, occupation, income, meeting1, meeting2,
            req.ip || req.connection.remoteAddress,
            req.get('User-Agent')
        ];
        
        db.run(insertQuery, params, async function(err) {
            if (err) {
                log(`데이터 저장 오류: ${err.message}`, 'ERROR');
                return res.status(500).json({
                    success: false,
                    message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                });
            }
            
            log(`새로운 문의 등록: ID ${this.lastID}, 이름: ${name}`, 'INFO');
            
            // Google Sheets로도 데이터 전송
            try {
                const sheetsData = {
                    name, birthdate, phone, email, gender, education, 
                    region, occupation, income, meeting1, meeting2,
                    ip_address: req.ip || req.connection.remoteAddress,
                    user_agent: req.get('User-Agent')
                };
                
                const sheetsResult = await sendToGoogleSheets(sheetsData);
                log(`Google Sheets 전송 결과: ${JSON.stringify(sheetsResult)}`, 'INFO');
                
                res.json({
                    success: true,
                    message: '문의가 성공적으로 등록되었습니다.',
                    inquiryId: this.lastID,
                    googleSheets: sheetsResult
                });
            } catch (sheetsError) {
                log(`Google Sheets 전송 실패: ${sheetsError.message}`, 'WARN');
                // Google Sheets 전송 실패해도 문의 등록은 성공으로 처리
                res.json({
                    success: true,
                    message: '문의가 성공적으로 등록되었습니다. (Google Sheets 동기화 실패)',
                    inquiryId: this.lastID,
                    googleSheets: { success: false, message: sheetsError.message }
                });
            }
        });
        
    } catch (error) {
        log(`문의 등록 중 예외 발생: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

// 2. 문의 목록 조회 API (관리자용)
app.get('/api/contact', async (req, res) => {
    try {
        await checkDatabaseConnection();
        
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = '';
        let params = [];
        
        if (status) {
            whereClause = 'WHERE status = ?';
            params.push(status);
        }
        
        const countQuery = `SELECT COUNT(*) as total FROM contact_inquiries ${whereClause}`;
        const listQuery = `
            SELECT * FROM contact_inquiries 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        // 전체 개수 조회
        db.get(countQuery, params, (err, countResult) => {
            if (err) {
                log(`목록 조회 오류: ${err.message}`, 'ERROR');
                return res.status(500).json({
                    success: false,
                    message: '데이터 조회 오류가 발생했습니다.'
                });
            }
            
            const total = countResult.total;
            
            // 목록 조회
            db.all(listQuery, [...params, limit, offset], (err, rows) => {
                if (err) {
                    log(`목록 조회 오류: ${err.message}`, 'ERROR');
                    return res.status(500).json({
                        success: false,
                        message: '데이터 조회 오류가 발생했습니다.'
                    });
                }
                
                res.json({
                    success: true,
                    data: {
                        inquiries: rows,
                        pagination: {
                            current: parseInt(page),
                            total: Math.ceil(total / limit),
                            totalCount: total
                        }
                    }
                });
            });
        });
        
    } catch (error) {
        log(`목록 조회 중 예외 발생: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 3. 문의 상세 조회 API
app.get('/api/contact/:id', async (req, res) => {
    try {
        await checkDatabaseConnection();
        
        const { id } = req.params;
        
        const query = 'SELECT * FROM contact_inquiries WHERE id = ?';
        
        db.get(query, [id], (err, row) => {
            if (err) {
                log(`상세 조회 오류: ${err.message}`, 'ERROR');
                return res.status(500).json({
                    success: false,
                    message: '데이터 조회 오류가 발생했습니다.'
                });
            }
            
            if (!row) {
                return res.status(404).json({
                    success: false,
                    message: '해당 문의를 찾을 수 없습니다.'
                });
            }
            
            res.json({
                success: true,
                data: row
            });
        });
        
    } catch (error) {
        log(`상세 조회 중 예외 발생: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 4. 문의 상태 업데이트 API (관리자용)
app.put('/api/contact/:id/status', async (req, res) => {
    try {
        await checkDatabaseConnection();
        
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태값입니다.'
            });
        }
        
        const query = 'UPDATE contact_inquiries SET status = ? WHERE id = ?';
        
        db.run(query, [status, id], function(err) {
            if (err) {
                log(`상태 업데이트 오류: ${err.message}`, 'ERROR');
                return res.status(500).json({
                    success: false,
                    message: '상태 업데이트 오류가 발생했습니다.'
                });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '해당 문의를 찾을 수 없습니다.'
                });
            }
            
            log(`문의 상태 업데이트: ID ${id} -> ${status}`, 'INFO');
            
            res.json({
                success: true,
                message: '상태가 성공적으로 업데이트되었습니다.'
            });
        });
        
    } catch (error) {
        log(`상태 업데이트 중 예외 발생: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 5. 통계 API (관리자용)
app.get('/api/contact/stats', async (req, res) => {
    try {
        await checkDatabaseConnection();
        
        const queries = {
            total: 'SELECT COUNT(*) as count FROM contact_inquiries',
            pending: 'SELECT COUNT(*) as count FROM contact_inquiries WHERE status = "pending"',
            contacted: 'SELECT COUNT(*) as count FROM contact_inquiries WHERE status = "contacted"',
            completed: 'SELECT COUNT(*) as count FROM contact_inquiries WHERE status = "completed"',
            today: 'SELECT COUNT(*) as count FROM contact_inquiries WHERE DATE(created_at) = DATE("now")',
            thisMonth: 'SELECT COUNT(*) as count FROM contact_inquiries WHERE strftime("%Y-%m", created_at) = strftime("%Y-%m", "now")'
        };
        
        const stats = {};
        let completedQueries = 0;
        const totalQueries = Object.keys(queries).length;
        
        Object.keys(queries).forEach(key => {
            db.get(queries[key], (err, row) => {
                if (err) {
                    log(`통계 조회 오류 (${key}): ${err.message}`, 'ERROR');
                } else {
                    stats[key] = row.count;
                }
                
                completedQueries++;
                if (completedQueries === totalQueries) {
                    res.json({
                        success: true,
                        data: stats
                    });
                }
            });
        });
        
    } catch (error) {
        log(`통계 조회 중 예외 발생: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 6. 서버 상태 확인 API
app.get('/api/health', async (req, res) => {
    try {
        await checkDatabaseConnection();
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            database: 'disconnected',
            error: error.message
        });
    }
});

// 메인 페이지 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 처리
app.use('*', (req, res) => {
    log(`404 오류: ${req.originalUrl}`, 'WARN');
    res.status(404).json({
        success: false,
        message: '요청한 페이지를 찾을 수 없습니다.'
    });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
    log(`전역 에러: ${error.message}`, 'ERROR');
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
    });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    log(`서버가 포트 ${PORT}에서 실행 중입니다. (환경: ${NODE_ENV})`);
    log(`데이터베이스 경로: ${DB_PATH}`);
    
    // 데이터베이스 초기화
    initDatabase();
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
    log('서버 종료 신호를 받았습니다. 정리 작업을 시작합니다...');
    
    if (db) {
        db.close((err) => {
            if (err) {
                log(`데이터베이스 연결 해제 오류: ${err.message}`, 'ERROR');
            } else {
                log('데이터베이스 연결이 해제되었습니다.');
            }
            
            logStream.end(() => {
                log('로그 스트림이 종료되었습니다.');
                process.exit(0);
            });
        });
    } else {
        logStream.end(() => {
            log('로그 스트림이 종료되었습니다.');
            process.exit(0);
        });
    }
});

process.on('uncaughtException', (error) => {
    log(`처리되지 않은 예외: ${error.message}`, 'ERROR');
    log(`스택 트레이스: ${error.stack}`, 'ERROR');
});

process.on('unhandledRejection', (reason, promise) => {
    log(`처리되지 않은 Promise 거부: ${reason}`, 'ERROR');
});
