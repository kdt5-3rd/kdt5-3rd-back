import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ 테스트 시작 전에 [TEST] 데이터 삭제
beforeEach(async () => {
    await prisma.task.deleteMany({
        where: {
            title: {
                contains: '[TEST]',
            },
        },
    });
});

// 테스트 실행 이후에는 테스트에 사용된 데이터만 식별해서 삭제.
afterAll(async () => {
    // [TEST]가 포함된 일정만 삭제하도록
    await prisma.task.deleteMany({
        where: {
            title: {
                contains: '[TEST]',
            },
        },
    });

    await prisma.$disconnect();
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Task API 통합 테스트', () => {

  it('✅ 일정을 등록할 수 있어야 한다', async () => {
        const response = await request(app)
        .post('/api/tasks')
        .send({
            title: '[TEST] 테스트 일정',
            start_time: '2025-02-05T14:00:00Z',
            latitude: 37.5665,
            longitude: 126.9780,
            from_lat: 37.5700,
            from_lng: 126.9769,
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('taskId');

        await sleep(100);  // ✅ 등록 후 DB 반영 대기
    });
  
    // 📅 일간 조회 테스트
    it('✅ 일간 일정을 조회할 수 있어야 한다', async () => {
        const response = await request(app)
            .get('/api/tasks/day')
            .query({
                year: 2025,
                month: 2,
                day: 5,
            });
    
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
  
    // 📅 주간 조회 테스트
    it('✅ 주간 일정을 조회할 수 있어야 한다', async () => {
        const response = await request(app)
            .get('/api/tasks/week')
            .query({
                year: 2025,
                month: 2,
                week: 5,
            });
    
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
  
    // 📅 월간 조회 테스트
    it('✅ 월간 일정을 조회할 수 있어야 한다', async () => {
        const response = await request(app)
            .get('/api/tasks/month')
            .query({
                year: 2025,
                month: 2,
            });
    
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});