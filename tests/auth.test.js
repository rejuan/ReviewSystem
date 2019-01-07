const request = require("supertest");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
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
  const exec = requestObjet => {
    return request(server)
      .post("/api/auth/registration")
      .send(requestObjet);
  };

  describe("POST /registration", () => {
    let name, email, password;

    beforeEach(() => {
      name = "test";
      email = "test@test.com";
      password = "123456";
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
});
