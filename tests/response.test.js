const request = require("supertest");
const moment = require("moment");
const {User} = require("../models/user");
const {Company} = require("../models/company");
const {Review} = require("../models/review");
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
    await Review.remove({});
    server.close();
});

describe("/api/response", () => {
    let url, name, email, password, companyData, company, user,
        reviewData, review, responseData, response;

    beforeEach(async () => {
        url = "/api/response";
        name = "test";
        email = "response@test.com";
        password = "123456";
        user = await saveUser(name, email, password);
        companyData = {
            name: name,
            contact: {
                mobile: 'mobile',
                address: 'address',
                website: 'http://website.com/'
            },
            details: 'details details',
            user: user._id.toString(),
            status: 'active'
        };
        company = await saveCompany(companyData);
        reviewData = {
            user: user._id.toString(),
            company: company._id.toString(),
            star: 2,
            title: "test title",
            details: "details description of a company"
        };

        review = await saveReview(reviewData);
        responseData = {
            id: review._id.toString(),
            response: "Thanks a lot."
        }
    });

    describe("POST /", () => {

        const exec = (requestObjet, token) => {
            return request(server)
                .post(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if no review found", async () => {
            const token = user.generateAuthToken();
            responseData.id = user._id; // wrong id
            const res = await exec(responseData, token);
            expect(res.status).toBe(404);
        });

        it("should return 401 if not company owner", async () => {
            const testUser = await saveUser(name, "response1@test.com", password);
            const token = testUser.generateAuthToken();
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if no response", async () => {
            const token = user.generateAuthToken();
            delete responseData.response;
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no review id", async () => {
            const token = user.generateAuthToken();
            delete responseData.id;
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if response less than 3", async () => {
            const token = user.generateAuthToken();
            responseData.response = "a";
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if response more than 512", async () => {
            const token = user.generateAuthToken();
            responseData.response = new Array(514).join("a");
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 200 if valid input", async () => {
            const token = user.generateAuthToken();
            const res = await exec(responseData, token);
            expect(res.status).toBe(200);
        });

    });

    describe("PUT /", () => {

        const exec = (requestObjet, token) => {
            return request(server)
                .put(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if no review found", async () => {
            const token = user.generateAuthToken();
            responseData.id = user._id; // wrong id
            const res = await exec(responseData, token);
            expect(res.status).toBe(404);
        });

        it("should return 401 if not company owner", async () => {
            const testUser = await saveUser(name, "response1@test.com", password);
            const token = testUser.generateAuthToken();
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if no response", async () => {
            const token = user.generateAuthToken();
            delete responseData.response;
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no review id", async () => {
            const token = user.generateAuthToken();
            delete responseData.id;
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if response less than 3", async () => {
            const token = user.generateAuthToken();
            responseData.response = "a";
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if response more than 512", async () => {
            const token = user.generateAuthToken();
            responseData.response = new Array(514).join("a");
            const res = await exec(responseData, token);
            expect(res.status).toBe(400);
        });

        it("should return 200 if valid input", async () => {
            review.response = "test";
            review = await review.save();
            const token = user.generateAuthToken();
            const res = await exec(responseData, token);
            expect(res.status).toBe(200);
        });

    });

    describe("DELETE /", () => {

        beforeEach(() => {
            delete responseData.response;
        });

        const exec = (requestObjet, token) => {
            return request(server)
                .delete(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if no review found", async () => {
            const token = user.generateAuthToken();
            responseData.id = user._id; // wrong id
            const res = await exec(responseData, token);
            expect(res.status).toBe(404);
        });

        it("should return 401 if not company owner", async () => {
            const testUser = await saveUser(name, "response1@test.com", password);
            const token = testUser.generateAuthToken();
            const res = await exec(responseData, token);
            expect(res.status).toBe(401);
        });

        it("should return 200 if valid input", async () => {
            review = await review.save();
            const token = user.generateAuthToken();
            const res = await exec(responseData, token);
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
    return await user.save();
}

async function saveCompany(companyData) {
    const company = new Company(companyData);
    return await company.save();
}

async function saveReview(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
}
