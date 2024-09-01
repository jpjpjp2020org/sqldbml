import request from 'supertest';
import buildApp from '../../app.js';
import UserRepo from '../../repos/user_repo.js';
import Context from '../context.js';

let context;

// need to connect to pool to run the test
beforeAll(async () => {
    try {
        context = await Context.build();
    } catch (err) {
        console.error('Error during context build in test:', err);
        throw err;
    }
});

beforeEach(async () => {

    await context.reset();

});

// need to close the connection too after the test
afterAll(async () => {
    if (context) {
        await context.close();
    }
});

// example problematic test with some problems need to be solved.
it('create a user', async () => {

    const startinCount = await UserRepo.count();
    // expect(startinCount).toEqual(2); // not hardcoding this

    await request(buildApp())
        .post('/users')
        .send({ username: 'testuser', bio: 'test bio' })
        .expect(200);

    const finishingCount = await UserRepo.count();
    // checking the procedural dif after test w/ hardcoding test values
    expect(finishingCount - startinCount).toEqual(1);

});