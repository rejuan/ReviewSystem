const request = require("supertest");
const moment = require("moment");
const {User} = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const _ = require("lodash");
let server;

beforeEach(() => {
    server = require("../index");
    jest.setTimeout(30000);
});

afterEach(async () => {
    await User.remove({});
    server.close();
});

describe("/api/company", () => {
    let url;

    const exec = (requestObjet, token) => {
        return request(server)
            .post(url)
            .set('x-auth-token', token)
            .field('name', requestObjet.name)
            .attach('image', 'tests/images/test.png');
    };

    describe("POST /", () => {
        let name, email, password;

        beforeEach(() => {
            name = "test";
            email = "test@test.com";
            password = "123456";
            url = "/api/company/";
        });

        it("should return 401 if no JWT", async () => {
            const user = await saveUser(name, email, password);
            const token = "";
            const res = await exec({name: "test company"}, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const user = await saveUser(name, email, password);
            const token = "1234";
            const res = await exec({name: "test company"}, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if name field empty", async () => {
            const user = await saveUser(name, email, password);
            const token = user.generateAuthToken();
            let res = await exec({name: ""}, token);
            expect(res.status).toBe(400);
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
        return await user.save();
    }
});
