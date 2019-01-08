const request = require("supertest");
const moment = require("moment");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");
const _ = require("lodash");
let server;

beforeEach(() => {
  server = require("../index");
});

afterEach(async () => {
  await User.remove({});
  server.close();
});

describe("/api/auth", () => {
  let url;

  const exec = requestObjet => {
    return request(server)
      .post(url)
      .send(requestObjet);
  };

  describe("POST /registration", () => {
    let name, email, password;

    beforeEach(() => {
      name = "test";
      email = "test@test.com";
      password = "123456";
      url = "/api/auth/registration";
    });

    it("should return 400 if user doesn't send any data", async () => {
      const res = await exec({});
      expect(res.status).toBe(400);
    });

    it("should return 400 if user doesn't send name", async () => {
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if user doesn't send email", async () => {
      const res = await exec({ name, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if user doesn't send password", async () => {
      const res = await exec({ name, email });
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is less than 3", async () => {
      name = "aa";
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50", async () => {
      name = new Array(55).join("a");
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is less than 5", async () => {
      email = "@a.";
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 255", async () => {
      email = new Array(255).join("a") + "@test.com";
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is not valid", async () => {
      email = "aaaaaa";
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email already exist", async () => {
      const user = new User({ name, email, password });
      user.save();
      const res = await exec({ name, email, password });
      expect(res.status).toBe(400);
    });

    it("should save if input is valid", async () => {
      const res = await exec({ name, email, password });
      const user = await User.findOne({ name: name });
      expect(res.status).toBe(200);
      expect(user).not.toBeNull();
      expect(user.name).toEqual(name);
    });

    it("should return user if input is valid", async () => {
      const res = await exec({ name, email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
    });

    it("should return valid jwt token if input is valid", async () => {
      const res = await exec({ name, email, password });
      expect(res.status).toBe(200);
      expect(res.header).toHaveProperty("x-auth-token");
      let token = res.get("x-auth-token");
      const decode = jwt.verify(token, config.get("jwtPrivateKey"));
      expect(decode).toMatchObject({
        _id: res.body._id,
        userType: "user"
      });
    });
  });

  describe("POST /signin", () => {
    let email, password;

    beforeEach(() => {
      url = "/api/auth/signin";
      email = "test@test.com";
      password = "123456";
    });

    it("should return 400 if user doesn't send any data", async () => {
      const res = await exec({});
      expect(res.status).toBe(400);
    });

    it("should return 400 if user doesn't send email", async () => {
      const res = await exec({ password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if user doesn't send password", async () => {
      const res = await exec({ email });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is less than 5", async () => {
      email = "@a.";
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 255", async () => {
      email = new Array(255).join("a") + "@test.com";
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is not valid", async () => {
      email = "aaaaaa";
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email not exist", async () => {
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return 400 if email and password doesn't match", async () => {
      const res = await exec({ email, password });
      expect(res.status).toBe(400);
    });

    it("should return user if input is valid", async () => {
      await saveUser(name, email, password);
      const res = await exec({ email, password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("email", email);
    });

    it("should return valid jwt token if input is valid", async () => {
      await saveUser(name, email, password);
      const res = await exec({ email, password });
      expect(res.status).toBe(200);
      expect(res.header).toHaveProperty("x-auth-token");
      let token = res.get("x-auth-token");
      const decode = jwt.verify(token, config.get("jwtPrivateKey"));
      expect(decode).toMatchObject({
        _id: res.body._id,
        userType: "user"
      });
    });
  });

  describe("POST /forgotPassword", () => {
    let email;

    beforeEach(() => {
      url = "/api/auth/forgotPassword";
      email = "test@test.com";
    });

    it("should return 400 if user doesn't send any data", async () => {
      const res = await exec({});
      expect(res.status).toBe(400);
    });

    it("should return 400 if email is not valid", async () => {
      email = "aaaaa";
      const res = await exec({email});
      expect(res.status).toBe(400);
    });

    it("should return 404 if email is not exist", async () => {
      email = "aaaaa@test.com";
      const res = await exec({email});
      expect(res.status).toBe(404);
    });

    it("should return 200 if email exist", async () => {
      await saveUser("test", email, "12345");

      const res = await exec({email});
      expect(res.status).toBe(200);
    });

    it("should add a token if email exist", async () => {
      await saveUser("test", email, "12345");
      const res = await exec({email});
      let user = await User.findOne({email});

      expect(user).not.toBeNull();
      expect(user).toHaveProperty('forgotPassword');
      expect(user.forgotPassword).toHaveProperty('token');
    });

    it("should have a createdAt which is less than 5 minutes if email exist", async () => {
      await saveUser("test", email, "12345");
      const res = await exec({email});
      let user = await User.findOne({email});

      expect(user).not.toBeNull();
      expect(user.forgotPassword).toHaveProperty('token');
      const now = moment();
      const was = moment(user.forgotPassword.createdAt * 1000);
      expect(now.diff(was,'minutes')).toBeLessThan(5);
    });

  })

  async function saveUser(name, email, password) {
    const user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
  }
});
