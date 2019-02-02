const request = require("supertest");
const moment = require("moment");
const {User} = require("../models/user");
const {Company} = require("../models/company");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const _ = require("lodash");
let server;

beforeEach(async () => {
    server = require("../index");
    jest.setTimeout(30000);
});

afterEach(async () => {
    await User.remove({});
    await Company.remove({});
    server.close();
});

describe("/api/user", () => {

    let name, email, password, user, url;

    beforeEach(async () => {
        name = "test";
        email = "user@test.com";
        password = "123456";
        user = await saveUser(name, email, password);
        user.userType = "admin";
        user = await user.save();
    });

    describe("GET /api/user/active", () => {

        beforeEach(async () => {
            url = "/api/user/active/";
        });

        const exec = (token) => {
            return request(server)
                .get(url)
                .set('x-auth-token', token)
                .send();
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(token);
            expect(res.status).toBe(400);
        });

        it("should return 401 if not admin", async () => {
            user.userType = "user";
            user = await user.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 200 if everything fine", async () => {
            url = url + "?pageNumber=1&pageSize=10";
            const token = user.generateAuthToken();
            let res = await exec(token);
            expect(res.status).toBe(200);
        });
    });

    describe("GET /api/user/suspended", () => {

        beforeEach(async () => {
            url = "/api/user/suspended/";
        });

        const exec = (token) => {
            return request(server)
                .get(url)
                .set('x-auth-token', token)
                .send();
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(token);
            expect(res.status).toBe(400);
        });

        it("should return 401 if not admin", async () => {
            user.userType = "user";
            user = await user.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 200 if everything fine", async () => {
            let testUser = await saveUser(name, "user2@test.com", password);
            testUser.status = "suspend";
            testUser = await testUser.save();

            url = url + "?pageNumber=1&pageSize=10";
            const token = user.generateAuthToken();
            let res = await exec(token);
            expect(res.status).toBe(200);
        });
    });

    describe("PUT /api/user/suspend/:id", () => {

        let testUser;

        beforeEach(async () => {
            url = "/api/user/suspend/";
            testUser = await saveUser(name, "user2@test.com", password);
            url = url + testUser._id.toString();
        });

        const exec = (token) => {
            return request(server)
                .put(url)
                .set('x-auth-token', token)
                .send();
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(token);
            expect(res.status).toBe(400);
        });

        it("should return 401 if not admin", async () => {
            user.userType = "user";
            user = await user.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 404 if not found", async () => {
            testUser.status = "suspend";
            testUser = await testUser.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(404);
        });

        it("should return 200 if valid input", async () => {
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(200);
        });
    });

    describe("PUT /api/user/unsuspend/:id", () => {

        let testUser;

        beforeEach(async () => {
            url = "/api/user/unsuspend/";
            testUser = await saveUser(name, "user2@test.com", password);
            url = url + testUser._id.toString();
        });

        const exec = (token) => {
            return request(server)
                .put(url)
                .set('x-auth-token', token)
                .send();
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(token);
            expect(res.status).toBe(400);
        });

        it("should return 401 if not admin", async () => {
            user.userType = "user";
            user = await user.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(401);
        });

        it("should return 404 if not found", async () => {
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(404);
        });

        it("should return 200 if valid input", async () => {
            testUser.status = "suspend";
            testUser = await testUser.save();
            const token = user.generateAuthToken();
            const res = await exec(token);
            expect(res.status).toBe(200);
        });
    });

});

async function saveUser(name, email, password) {
    const forgotPassword = {
        token: crypto.randomBytes(20).toString('hex'),
        createdAt: moment().unix()
    };

    const user = new User({name, email, password, forgotPassword});
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.status = "active";
    return await user.save();
}
