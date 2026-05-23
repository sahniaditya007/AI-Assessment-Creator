"use client";

import type { GeneratedPaper } from "@/types/assessment";
import { DifficultyBadge } from "./DifficultyBadge";

interface ExamPaperProps {
  paper: GeneratedPaper;
  schoolName?: string;
  classLevel?: string;
}

export function ExamPaper({
  paper,
  schoolName = "Delhi Public School, Sector-4, Bokaro",
  classLevel = "5th",
}: ExamPaperProps) {
  return (
    <article className="rounded-4xl bg-white p-5 font-inter md:p-8">
      <header className="text-center">
        <h1 className="text-lg font-bold leading-[160%] tracking-[-0.04em] text-primary md:text-[32px]">
          {schoolName}
          <br />
          {paper.subject ? `Subject: ${paper.subject}` : ""}
          {paper.subject && <br />}
          Class: {classLevel}
        </h1>
      </header>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm font-semibold leading-[160%] tracking-[-0.04em] text-primary md:mt-6 md:gap-4 md:text-lg">
        <span>Time Allowed: {paper.durationMinutes ?? 45} minutes</span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      <p className="mt-3 text-sm font-semibold leading-[160%] tracking-[-0.04em] text-primary md:mt-4 md:text-lg">
        All questions are compulsory unless stated otherwise.
      </p>

      <div className="mt-3 space-y-1 text-sm font-semibold leading-[160%] tracking-[-0.04em] text-primary md:mt-4 md:text-lg">
        <p>Name: ______________________</p>
        <p>Roll Number: ________________</p>
        <p>Class: {classLevel} &nbsp; Section: __________</p>
      </div>

      {paper.sections.map((section) => (
        <section key={section.id} className="mt-6 md:mt-8">
          <h2 className="text-center text-lg font-semibold leading-[160%] tracking-[-0.04em] text-primary md:text-2xl">
            Section {section.label}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-[160%] tracking-[-0.04em] text-primary md:text-lg">
            {section.title.replace(/^Section [A-Z]\s*[—-]\s*/i, "")}
            {" — "}
            {section.instruction}
            {section.questions[0] &&
              ` Each question carries ${section.questions[0].marks} mark${section.questions[0].marks !== 1 ? "s" : ""}.`}
          </p>

          <div className="mt-3 space-y-2 md:mt-4 md:space-y-0">
            {section.questions.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl bg-bg-off-white p-3 text-sm leading-[200%] tracking-[-0.04em] text-primary md:rounded-none md:bg-transparent md:p-0 md:text-base md:leading-[240%]"
              >
                <span className="inline">
                  <DifficultyBadge difficulty={q.difficulty} /> {q.text}{" "}
                </span>
                <span className="font-normal">
                  [{q.marks} Mark{q.marks !== 1 ? "s" : ""}]
                </span>
                {q.options && q.options.length > 0 && (
                  <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 pl-0 md:ml-6 md:block md:space-y-1">
                    {q.options.map((opt, i) => (
                      <li key={i} className="leading-[180%] md:leading-[200%]">
                        {String.fromCharCode(97 + i)}) {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
