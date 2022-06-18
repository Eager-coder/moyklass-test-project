import { Router } from "express"
import db from "../db"
import { getLessonsValidation, QueryParams } from "../validation"

const router = Router()

router.get("/", async (req, res) => {
	try {
		getLessonsValidation(req.query)
	} catch (error: any) {
		console.log(error)
		return res.status(400).json({ message: error.message })
	}
	try {
		let { date, status, teacherIds, studentsCount, page, lessonsPerPage }: QueryParams = req.query
		const rows = await db
			.table("lessons")
			.select("*", db("lesson_students").count().whereRaw("lessons.id = lesson_students.lesson_id").as("visitCount"))
			.modify(queryBuilder => {
				if (date) {
					if (date.includes(",")) {
						const dates = date.split(",")
						queryBuilder.whereIn("date", [dates[0], dates[1]])
					} else {
						queryBuilder.where("date", date)
					}
				}

				if (status) {
					queryBuilder.where("status", status)
				}

				if (status) {
					queryBuilder.where("status", status)
				}
				if (page) {
					page = page || "1"
					queryBuilder.offset((Number(page) - 1) * Number(lessonsPerPage))
				}

				if (teacherIds) {
					queryBuilder.whereIn(
						"lessons.id",
						db
							.table("lesson_teachers")
							.select("lesson_teachers.lesson_id")
							.whereIn("lesson_teachers.teacher_id", teacherIds.split(",")),
					)
				}
				if (studentsCount) {
					if (studentsCount.includes(",")) {
						queryBuilder.whereIn(
							"lessons.id",
							db
								.table("lesson_students")
								.select("lesson_students.lesson_id")
								.groupBy("lesson_students.lesson_id")
								.havingRaw(`count(*) >= ${studentsCount.split(",")[0]} AND count(*) <= ${studentsCount.split(",")[1]}`),
						)
					} else {
						queryBuilder.whereIn(
							"lessons.id",
							db
								.table("lesson_students")
								.select("lesson_students.lesson_id")
								.groupBy("lesson_students.lesson_id")
								.havingRaw(`count(*) = ${studentsCount}`),
						)
					}
				}
				if (lessonsPerPage) {
					queryBuilder.limit(Number(lessonsPerPage))
				} else {
					queryBuilder.limit(5)
				}
				queryBuilder.orderBy("id", "asc")
			})
		const teachers = await db("teachers")
			.select("*", "lesson_teachers.lesson_id")
			.leftJoin("lesson_teachers", "lesson_teachers.teacher_id", "=", "teachers.id")
			.whereIn(
				"lesson_teachers.lesson_id",
				rows.map((row: any) => row.id),
			)
		const students = await db("students")
			.select("*", "lesson_students.lesson_id", "visit")
			.leftJoin("lesson_students", "lesson_students.student_id", "=", "students.id")
			.whereIn(
				"lesson_students.lesson_id",
				rows.map((row: any) => row.id),
			)
		rows.forEach((row: any) => {
			row.visitCount = Number(row.visitCount)
			row.teachers = teachers
				.filter((teacherRow: any) => teacherRow.lesson_id === row.id)
				.map((teacherRow: any) => {
					return { id: teacherRow.id, name: teacherRow.name }
				})
			row.students = students
				.filter((studentRow: any) => studentRow.lesson_id === row.id)
				.map((studentRow: any) => {
					return { id: studentRow.id, name: studentRow.name, visit: studentRow.visit }
				})
		})
		res.json(rows)
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: "Something went wrong." })
	}
})

export { router as RootRouter }
