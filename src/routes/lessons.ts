import dayjs, { Dayjs } from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import { Router } from "express"
import db from "../db"
import { Body, createLessonValidation } from "../validation"
const router = Router()

dayjs.extend(isBetween)

router.post("/", async (req, res) => {
	const { teacherIds, title, days, firstDate, lessonsCount, lastDate }: Body = req.body
	try {
		createLessonValidation({ teacherIds, title, days, firstDate, lessonsCount, lastDate })
	} catch (error: any) {
		console.log("/lessons", error)
		return res.status(400).json({ message: error.message })
	}
	try {
		let date = dayjs(firstDate)
		let count = 0
		let lessonDates: Dayjs[] = []
		if (lessonsCount) {
			if (isNaN(lessonsCount)) {
				throw new Error("Please provide a valid number for the lessons count.")
			}
			if (Number(lessonsCount) > 300) {
				throw new Error("Lessons count must not exceed 300.")
			}
			while (date.diff(firstDate, "year") <= 1 && count < lessonsCount) {
				days.forEach((day: number) => {
					if (day == date.get("day")) {
						lessonDates.push(date)
						count++
					}
				})
				date = date.add(1, "day")
			}
		}
		if (lastDate) {
			while (
				dayjs(date).isBetween(firstDate, lastDate, "day", "[]") &&
				date.diff(firstDate, "year") <= 1 &&
				count < 300
			) {
				days.forEach((day: number) => {
					if (day == date.get("day")) {
						lessonDates.push(date)
						count++
					}
				})
				date = date.add(1, "day")
			}
		}
		let newLessonIds = await db("lessons")
			.insert(lessonDates.map(date => ({ date: date.format("YYYY-MM-DD"), title })))
			.returning("id")
		const lessonTeachers: { lesson_id: number; teacher_id: number }[] = []
		newLessonIds.forEach(({ id }) => {
			teacherIds.forEach(teacherId => {
				lessonTeachers.push({ lesson_id: id, teacher_id: teacherId })
			})
		})

		await db("lesson_teachers").insert(lessonTeachers)
		res.json(newLessonIds)
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: "Something went wrong." })
	}
})

export { router as LessonsRouter }
