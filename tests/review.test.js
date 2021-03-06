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

describe("/api/review", () => {
    let url, name, email, password, companyData, company, user, reviewData, review;

    beforeEach(async () => {
        url = "/api/review";
        name = "test";
        email = "review@test.com";
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
            company: company._id.toString(),
            star: 2,
            title: "test title",
            details: "details description of a company"
        };
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
            const res = await exec(reviewData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no company", async () => {
            const token = user.generateAuthToken();
            delete reviewData.company;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if company id not valid", async () => {
            const token = user.generateAuthToken();
            reviewData.company = "123";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no star", async () => {
            const token = user.generateAuthToken();
            delete reviewData.star;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if star less than 1", async () => {
            const token = user.generateAuthToken();
            reviewData.star = 0;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if star more than 5", async () => {
            const token = user.generateAuthToken();
            reviewData.star = 6;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no title", async () => {
            const token = user.generateAuthToken();
            delete reviewData.title;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if title less than 3", async () => {
            const token = user.generateAuthToken();
            reviewData.title = "a";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if title more than 30", async () => {
            const token = user.generateAuthToken();
            reviewData.title = new Array(32).join("a");
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no details", async () => {
            const token = user.generateAuthToken();
            delete reviewData.details;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if details less than 3", async () => {
            const token = user.generateAuthToken();
            reviewData.details = "aa";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if details more than 1024", async () => {
            const token = user.generateAuthToken();
            reviewData.details = new Array(1026).join("a");
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if company not exist", async () => {
            const token = user.generateAuthToken();
            reviewData.company = user._id;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(404);
        });

        it("should return 200 if valid input", async () => {
            const token = user.generateAuthToken();
            const res = await exec(reviewData, token);
            expect(res.status).toBe(200);
        });

    });

    describe("PATCH /:id", () => {

        beforeEach(async () => {
            reviewData.user = user._id.toString();
            review = await saveReview(reviewData);
            delete reviewData.user;
            delete reviewData.company;
            url = url + "/" + review._id.toString();
        });

        const exec = (requestObjet, token) => {
            return request(server)
                .patch(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no star", async () => {
            const token = user.generateAuthToken();
            delete reviewData.star;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if star less than 1", async () => {
            const token = user.generateAuthToken();
            reviewData.star = 0;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if star more than 5", async () => {
            const token = user.generateAuthToken();
            reviewData.star = 6;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no title", async () => {
            const token = user.generateAuthToken();
            delete reviewData.title;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if title less than 3", async () => {
            const token = user.generateAuthToken();
            reviewData.title = "a";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if title more than 30", async () => {
            const token = user.generateAuthToken();
            reviewData.title = new Array(32).join("a");
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if no details", async () => {
            const token = user.generateAuthToken();
            delete reviewData.details;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if details less than 3", async () => {
            const token = user.generateAuthToken();
            reviewData.details = "aa";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 400 if details more than 1024", async () => {
            const token = user.generateAuthToken();
            reviewData.details = new Array(1026).join("a");
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if user doesn't the owner of given id", async () => {
            const anotherUser = await saveUser(
                "test", "random@random.com", "12345");
            const token = anotherUser.generateAuthToken();

            reviewData.title = "edited title";
            reviewData.details = "edited details";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(404);
        });

        it("should return 200 if valid input", async () => {
            const token = user.generateAuthToken();
            reviewData.title = "edited title";
            reviewData.details = "edited details";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(200);
        });

    });

    describe("DELETE /:id", () => {

        beforeEach(async () => {
            reviewData.user = user._id.toString();
            review = await saveReview(reviewData);
            delete reviewData.user;
            delete reviewData.company;
            url = url + "/" + review._id.toString();
        });

        const exec = (requestObjet, token) => {
            return request(server)
                .delete(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 404 if user doesn't the owner of given id", async () => {
            const anotherUser = await saveUser(
                "test", "random@random.com", "12345");
            const token = anotherUser.generateAuthToken();

            const res = await exec(reviewData, token);
            expect(res.status).toBe(404);
        });

        it("should return 200 if valid input", async () => {
            const token = user.generateAuthToken();
            const res = await exec(reviewData, token);
            expect(res.status).toBe(200);
        });

        it("should return 200 if admin", async () => {
            let anotherUser = await saveUser(
                "test", "random@random.com", "12345");
            anotherUser.userType = "admin";
            anotherUser = await anotherUser.save();

            const token = anotherUser.generateAuthToken();
            const res = await exec(reviewData, token);
            expect(res.status).toBe(200);
        });

    });

    describe("GET /", () => {

        beforeEach(async () => {
            reviewData.user = user._id.toString();
            review = await saveReview(reviewData);
        });

        const exec = (requestObjet, token) => {
            return request(server)
                .get(url)
                .set('x-auth-token', token)
                .send(requestObjet);
        };

        it("should return 401 if no JWT", async () => {
            const token = "";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(401);
        });

        it("should return 400 if JWT not valid", async () => {
            const token = "1234";
            const res = await exec(reviewData, token);
            expect(res.status).toBe(400);
        });

        it("should return 200 if valid input for my reviews", async () => {
            const token = user.generateAuthToken();
            delete reviewData.user;
            delete reviewData.company;
            const res = await exec(reviewData, token);
            expect(res.status).toBe(200);
        });

        it("should return 200 if valid input for company reviews", async () => {
            const token = user.generateAuthToken();
            delete reviewData.user;
            const res = await exec(reviewData, token);
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
