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

describe("/api/company", () => {
    let url;

    describe("POST /", () => {
        let name, email, password;

        const exec = (requestObjet, token) => {
            return request(server)
                .post(url)
                .set('x-auth-token', token)
                .field('name', requestObjet.name)
                .attach('image', 'tests/images/test.png');
        };

        const execAllField = (requestObjet, token) => {
            return request(server)
                .post(url)
                .set('x-auth-token', token)
                .field('name', requestObjet.name)
                .field('mobile', requestObjet.mobile)
                .field('address', requestObjet.address)
                .field('website', requestObjet.website)
                .field('details', requestObjet.details)
                .attach('image', 'tests/images/test.png');
        };

        beforeEach(() => {
            name = "test";
            email = "company@test.com";
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

            res = await exec({name: "a"}, token);
            expect(res.status).toBe(400);

            name = new Array(257).join('a');
            res = await exec({name: name}, token);
            expect(res.status).toBe(400);
        });

        it("should return 200 if input valid", async () => {
            const user = await saveUser(name, email, password);
            const token = user.generateAuthToken();

            const companyData = {
                name: name,
                mobile: 'mobile',
                address: 'address',
                website: 'http://website.com/',
                details: 'details details'
            };

            let res = await execAllField(companyData, token);
            expect(res.status).toBe(200);
        });
    });

    describe("before each save user and company", () => {

        let name, email, password, companyData, user;

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
                status: 'active'
            };
            companyData = await saveCompany(companyData);
        });

        describe("PATCH /:id", () => {

            beforeEach(async () => {
                url = "/api/company/" + companyData._id.toString();
            });

            const exec = (requestObjet, token) => {
                return request(server)
                    .patch(url)
                    .set('x-auth-token', token)
                    .field('name', requestObjet.name)
                    .attach('image', 'tests/images/test.png');
            };

            const execAllField = (requestObjet, token) => {
                return request(server)
                    .patch(url)
                    .set('x-auth-token', token)
                    .field('name', requestObjet.name)
                    .field('mobile', requestObjet.mobile)
                    .field('address', requestObjet.address)
                    .field('website', requestObjet.website)
                    .field('details', requestObjet.details)
                    .attach('image', 'tests/images/test.png');
            };

            it("should return 401 if no JWT", async () => {
                const token = "";
                const res = await exec({name: "test company"}, token);
                expect(res.status).toBe(401);
            });

            it("should return 400 if JWT not valid", async () => {
                const token = "1234";
                const res = await exec({name: "test company"}, token);
                expect(res.status).toBe(400);
            });

            it("should return 400 if name field empty", async () => {
                const token = user.generateAuthToken();
                let res = await exec({name: ""}, token);
                expect(res.status).toBe(400);

                res = await exec({name: "a"}, token);
                expect(res.status).toBe(400);

                name = new Array(257).join('a');
                res = await exec({name: name}, token);
                expect(res.status).toBe(400);
            });

            it("should return 200 if input valid", async () => {
                const token = user.generateAuthToken();
                name = "test edit";
                let mobile = "mobile edit";
                let address = "address edit";
                let website = "website edit";
                let details = "details edit";

                let res = await execAllField({
                    name, mobile, address, website, details
                }, token);
                expect(res.status).toBe(200);
            });

            it("should return 200 if input valid and admin", async () => {
                let adminUser = await saveUser(name, "company.admin@test.com", password);
                adminUser.userType = "admin";
                adminUser = await adminUser.save();

                const token = adminUser.generateAuthToken();
                name = "test edit";
                let mobile = "mobile edit";
                let address = "address edit";
                let website = "website edit";
                let details = "details edit";

                let res = await execAllField({
                    name, mobile, address, website, details
                }, token);
                expect(res.status).toBe(200);
            });
        });

        describe("DELETE /:id", () => {

            beforeEach(() => {
                url = "/api/company/" + companyData._id.toString();
            });

            const exec = (token) => {
                return request(server)
                    .delete(url)
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

            it("should return 404 if company not exist", async () => {
                companyData.status = 'delete';
                await companyData.save();

                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(404);
            });

            it("should return 200 if successfully delete", async () => {
                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(200);
            });

            it("should return 200 if admin & successfully delete", async () => {
                let adminUser = await saveUser(name, "company.admin@test.com", password);
                adminUser.userType = "admin";
                adminUser = await adminUser.save();

                const token = adminUser.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(200);
            });
        });

        describe("GET /:id", () => {

            beforeEach(async () => {
                url = "/api/company/" + companyData._id.toString();
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

            it("should return 404 if company not exist", async () => {
                companyData.status = 'delete';
                await companyData.save();

                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(404);
            });

            it("should return 200 if company exist", async () => {
                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(200);
            });
        });

        describe("PATCH /suspend/:id", () => {

            beforeEach(async () => {
                url = "/api/company/suspend/" + companyData._id.toString();
            });

            const exec = (token) => {
                return request(server)
                    .patch(url)
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

            it("should return 401 if user not admin", async () => {
                const token = user.generateAuthToken();
                const res = await exec(token);
                expect(res.status).toBe(401);
            });

            it("should return 404 if company not exist", async () => {
                user.userType = 'admin';
                await user.save();

                companyData.status = 'delete';
                await companyData.save();

                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(404);
            });

            it("should return 200 if successfully delete", async () => {
                user.userType = 'admin';
                await user.save();

                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(200);
            });
        });

        describe("GET /", () => {

            beforeEach(async () => {
                url = "/api/company/";
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

            it("should return 200 if company exist", async () => {
                const token = user.generateAuthToken();
                let res = await exec(token);
                expect(res.status).toBe(200);
            });
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
