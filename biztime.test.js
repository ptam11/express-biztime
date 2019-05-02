process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("./app");
const db = require("./db");

let company;

beforeEach(async function () {
    let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('ll', 'llamaCorp', 'stuff about llamas')  
      RETURNING code, name`);
    company = result.rows[0];
});

describe("GET /companies", function () {
    test("Gets a list of companies", async function () {
        const response = await request(app).get(`/companies`);
        const { companies } = response.body;
        expect(response.statusCode).toEqual(200);
        expect(companies).toHaveLength(1);
        expect(companies[0]).toEqual({code:"ll", name:"llamaCorp"});
    });
});

describe("GET /companies/:code", function () {
    test("Gets a company", async function () {
        const response = await request(app).get(`/companies/${company.code}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.company).toEqual([{code:"ll", name:"llamaCorp", description:"stuff about llamas"}]);
    });

    test("Responds with 404 if can't find a company", async function () {
        const response = await request(app).get(`/company/0`);
        expect(response.statusCode).toEqual(404);
    });
})

describe("POST /companies", function () {
    test("Creates a company", async function () {
        const response = await request(app)
            .post(`/companies`)
            .send({
                code: "red",
                name: "Lobster",
                description: "cheddar biscuits"
            });
        expect(response.statusCode).toEqual(201);
        expect(response.body.company).toHaveProperty("description");
        expect(response.body.company).toHaveProperty("code");
        expect(response.body.company).toHaveProperty("name");
        expect(response.body.company.name).toEqual("Lobster");
        expect(response.body.company.code).toEqual("red");
        expect(response.body.company.description).toEqual("cheddar biscuits");
    });
});

describe("PUT /companies/:code", function () {
    test("Updates a single company", async function () {
        const response = await request(app)
            .put(`/companies/${company.code}`)
            .send({
                name: "spitter",
                description: "bad llama"
            });
        expect(response.statusCode).toEqual(202);
        expect(response.body.company).toEqual({
            code: company.code, name: "spitter", description: "bad llama"
        });
    });

    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).patch(`/company/0`);
        expect(response.statusCode).toEqual(404);
    });
});

describe("DELETE /companies/:code", function () {
    test("Deletes a single a company", async function () {
        const response = await request(app)
            .delete(`/companies/${company.code}`);
        expect(response.statusCode).toEqual(202);
        expect(response.body).toEqual({status: "deleted"});
    });
});

afterEach(async function () {
    // delete any data created by test
    await db.query('DELETE FROM companies');
});

afterAll(async function () {
    // close db connection
    await db.end();
});
