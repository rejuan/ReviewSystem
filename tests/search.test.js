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

describe("/api/search", () => {

    let name, email, password, companyData, user, url;

    beforeEach(async () => {
        name = "test";
        email = "company@test.com";
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
            tags: ["can", "canada", "candy"],
            status: 'active'
        };
        companyData = await saveCompany(companyData);
    });

    describe("GET /api/search/company", () => {

        beforeEach(async () => {
            url = "/api/search/company/";
        });

        const exec = () => {
            return request(server)
                .get(url)
                .send();
        };

        it("should return 200 if company exist", async () => {
            url = url + "?keyword=te&pageNumber=1&pageSize=1";
            let res = await exec();
            expect(res.status).toBe(200);
        });
    });

    describe("GET /api/search/tag", () => {

        beforeEach(async () => {
            url = "/api/search/tag/";
        });

        const exec = () => {
            return request(server)
                .get(url)
                .send();
        };

        it("should return 200 if company exist", async () => {
            url = url + "?keyword=ca&pageNumber=1&pageSize=1";
            let res = await exec();
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
