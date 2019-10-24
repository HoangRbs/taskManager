const request = require('supertest');
const {UserModel} = require('../src/models/user');
const {userOneId,userOneInfo,initDatabase} = require('./fixtures/db');

let server;
let res;

beforeEach(async() => {
    server = require('../src/index');
    await initDatabase();
});

afterEach(() => {
    server.close();
});

//mock my own function
    //jest.mock('../emails/account');

//mock public module(no need to user jest.mock() ->it'll do automatically)


it('should sign up a new user',async() => {
    res = await request(server).post('/user/create').send({
        name: "zingspeed",
        email: "zingspeedvictorydarkness@gmail.com",
        password: "12345"
    });
    expect(res.status).toBe(200);

    //after getting 201 respond -> there's a chance that user may not saved in db
    const user = await UserModel.findById(res.body.user._id);
    expect(user).not.toBeNull();

    //checking more specificly
    expect(res.body).toMatchObject({
        user:{
            name: "zingspeed",
            email: "zingspeedvictorydarkness@gmail.com"
        },
        token: user.tokens[0].token  
    });

    //checking password is not plaintext
    expect(user.password).not.toBe('12345');
});

it('should not login existing user',async() => {
    const temp = {
        email: userOneInfo.email,
        password: 'you shall not pass'
    }
    res = await request(server).post('/user/login').send(temp);

    expect(res.status).toBe(400);
    
})

it('should login existing user',async() => {    
    const temp = {
        email: userOneInfo.email,
        password: userOneInfo.password
    }
    res = await request(server).post('/user/login').send(temp);

    expect(res.status).toBe(200);
    
})

it('should return user info of currentLogging token (userOne)',async() => {
    const res = await request(server)
                        .get('/user/myinfo')
                        .set('Authorization',userOneInfo.tokens[0].token)
                        .send();

    expect(res.body).toHaveProperty('_id',userOneId.toHexString());
})

it('should not return user info not using token',async() => {
    const res = await request(server)
                        .get('/user/myinfo')
                        .send();

    expect(res.status).toBe(401);
})

it('should delete current logging user (with current token)',async ()=>{
    const res = await request(server)
                        .delete('/user/delete/me')
                        .set('Authorization',userOneInfo.tokens[0].token)
                        .send();

    expect(res.status).toBe(200);

    const user = await UserModel.findById(userOneId);
    expect(user).toBeNull();
})

it('should not delete current logging user (with invalid token)',async ()=>{
    const res = await request(server)
                        .delete('/user/delete/me')
                        .set('Authorization','some bullshit token')
                        .send();

    expect(res.status).toBe(401);
})

it('should upload image to userOne',async() => {
    const res = await request(server)
                        .post('/user/me/avatar')
                        .set('Authorization',userOneInfo.tokens[0].token)
                        .attach('avatar','tests/fixtures/elle.png');
    expect(res.status).toBe(200);
    const userOne = await UserModel.findById(userOneId);
    expect(userOne.avatar).toEqual(expect.any(Buffer));
})

it('should update valid user field',async()  =>{
    const res = await request(server)
                        .patch('/user/update/me')
                        .set('Authorization',userOneInfo.tokens[0].token)
                        .send({ name: 'hoangdeptrai' })
                        .expect(200);
    
    const user = await UserModel.findById(userOneId);
    expect(user.name).toEqual('hoangdeptrai');
})






