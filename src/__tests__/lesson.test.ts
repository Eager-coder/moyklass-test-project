import request from "supertest"
import { app } from "../index"

describe("Lessons", () => {
	describe("GET /", () => {
		test("should respond with a 200 status code and a content type JSON", () => {
			request(app).get("/").expect(200).expect("Content-Type", /json/)
		})
		test("should return an array of lessons", async () => {
			const response = await request(app).get("/?lessonsPerPage=20")
			expect(response.body).toEqual(
				expect.arrayContaining([
					{
						id: expect.any(Number),
						date: expect.any(String),
						title: expect.any(String),
						status: expect.any(Number),
						visitCount: expect.any(Number),
						teachers: expect.arrayContaining([{ id: expect.any(Number), name: expect.any(String) }]),
						students: expect.arrayContaining([
							{ id: expect.any(Number), name: expect.any(String), visit: expect.any(Boolean) },
						]),
					},
				]),
			)
		})
	})
	describe("POST /lessons", () => {
		describe("Given both lastDate and lessonsCount", () => {
			test("Should return a status code of 400", async () => {
				const response = await request(app)
					.post("/lessons")
					.send({
						teacherIds: [1, 2],
						title: "Blue Ocean",
						days: [0, 1, 3, 6],
						firstDate: "2019-09-10",
						lastDate: "2020-09-10",
						lessonsCount: 20,
					})
				expect(response.statusCode).toEqual(400)
			})
		})
		describe("Given either of lastDate and lessonsCount", () => {
			test("Should return a status code of 200 and an array of lesson IDs", async () => {
				const response = await request(app)
					.post("/lessons")
					.send({
						teacherIds: [1, 2],
						title: "Blue Ocean",
						days: [0, 1, 3, 6],
						firstDate: "2019-09-10",
						lessonsCount: 9,
					})
				expect(response.body).toEqual(expect.arrayContaining([{ id: expect.any(Number) }]))
				expect(response.statusCode).toEqual(200)
			})
		})
	})
})
