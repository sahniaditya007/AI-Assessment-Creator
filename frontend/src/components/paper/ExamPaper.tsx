"use client";

import type { GeneratedPaper } from "@/types/assessment";
import { DifficultyBadge } from "./DifficultyBadge";

interface ExamPaperProps {
  paper: GeneratedPaper;
  schoolName?: string;
  className?: string;
}

export function ExamPaper({
  paper,
  schoolName = "Delhi Public School, Sector-4, Bokaro",
  className: classLabel = "5th",
}: ExamPaperProps) {
  return (
    <article className="rounded-4xl bg-white p-8 font-inter md:p-8">
      <header className="text-center">
        <h1 className="text-[32px] font-bold leading-[160%] tracking-[-0.04em] text-primary">
          {schoolName}
          <br />
          {paper.subject ? `Subject: ${paper.subject}` : ""}
          {paper.subject && <br />}
          Class: {classLabel}
        </h1>
      </header>

      <div className="mt-6 flex flex-wrap justify-between gap-4 text-lg font-semibold leading-[160%] tracking-[-0.04em] text-primary">
        <span>
          Time Allowed: {paper.durationMinutes ?? 45} minutes
        </span>
        <span>Maximum Marks: {paper.totalMarks}</span>
      </div>

      <p className="mt-4 text-lg font-semibold leading-[160%] tracking-[-0.04em] text-primary">
        All questions are compulsory unless stated otherwise.
      </p>

      <div className="mt-4 space-y-1 text-lg font-semibold leading-[160%] tracking-[-0.04em] text-primary">
        <p>Name: ______________________</p>
        <p>Roll Number: ________________</p>
        <p>Class: {classLabel} &nbsp; Section: __________</p>
      </div>

      {paper.sections.map((section) => (
        <section key={section.id} className="mt-8">
          <h2 className="text-center text-2xl font-semibold leading-[160%] tracking-[-0.04em] text-primary">
            Section {section.label}
          </h2>
          <p className="mt-2 text-lg font-semibold leading-[160%] tracking-[-0.04em] text-primary">
            {section.title.replace(/^Section [A-Z]\s*[—-]\s*/i, "")}
            {" — "}
            {section.instruction}
            {section.questions[0] &&
              ` Each question carries ${section.questions[0].marks} mark${section.questions[0].marks !== 1 ? "s" : ""}.`}
          </p>

          <div className="mt-4 space-y-0">
            {section.questions.map((q) => (
              <div key={q.id} className="leading-[240%] tracking-[-0.04em] text-primary">
                <span className="inline">
                  <DifficultyBadge difficulty={q.difficulty} /> {q.text}{" "}
                </span>
                <span className="font-normal">
                  [{q.marks} Mark{q.marks !== 1 ? "s" : ""}]
                </span>
                {q.options && q.options.length > 0 && (
                  <ul className="ml-6 list-none space-y-1 pl-0">
                    {q.options.map((opt, i) => (
                      <li key={i} className="leading-[200%]">
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
