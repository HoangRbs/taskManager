const request = require('supertest');
const { TaskModel } = require('../src/models/task');
const { userOneId,userOneInfo,
        userTwoId,userTwoInfo,
        taskOneInfo,
        taskTwoInfo,
        taskThreeInfo,
        initDatabase
      } = require('./fixtures/db');

let server;
let res;

beforeEach(async() => {
    server = require('../src/index');
    await initDatabase();
});

afterEach(() => {
    server.close();
});

it('should create task for user',async() => {
    res = await request(server)
            .post('/task/create')
            .set('Authorization',userOneInfo.tokens[0].token)
            .send({ description: 'random doing random things' })
            .expect(200);
    
    const task = await TaskModel.findById(res.body._id);
    expect(task).not.toBeNull();
    expect(task.description).toBe('random doing random things');
    expect(task.owner).toEqual(userOneInfo._id);
});

it('should show user tasks',async ()=>{
    res = await request(server)
                    .get('/task/show')
                    .set('Authorization',userOneInfo.tokens[0].token)
                    .send()
                    .expect(200);
    expect(res.body.length).toEqual(2);
})

it('should not delete other user task',async () =>{
    res = await request(server)
                    .delete('/task/delete/' + taskOneInfo._id)
                    .set('Authorization', userTwoInfo.tokens[0].token)
                    .send()
                    
    expect(res.status).toBe(404);
    const task = await TaskModel.findById(taskOneInfo._id);
    expect(task).not.toBeNull();
})