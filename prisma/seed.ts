import { PrismaClient } from "@prisma/client";
import { SUBJECT_NAMES } from "../src/lib/subjects";

const prisma = new PrismaClient();

const OWNER_EMAIL = "michelle.c@bam.org.my";

const sampleDecisions = [
  {
    decisionDate: new Date("2025-03-15"),
    title: "Approval of FY2026 Operating Budget",
    subjectNames: ["Finance", "Council"],
    keywords: "budget, fiscal year, operating expenses, revenue projections",
    description:
      "The Board unanimously approved the Fiscal Year 2026 operating budget totaling $48.2 million, representing a 3.2% increase over the prior year. The budget allocates increased funding for infrastructure maintenance ($2.1M), employee compensation adjustments ($1.4M), and technology modernization initiatives ($890K). Revenue projections are based on conservative growth estimates of 2.8% in property tax receipts and stable grant funding. The Finance Committee's recommendations were adopted without amendment. Implementation begins July 1, 2025.",
  },
  {
    decisionDate: new Date("2025-02-28"),
    title: "Remote Work Policy Amendment — Hybrid Schedule Standard",
    subjectNames: ["HR", "Governance"],
    keywords: "remote work, hybrid, HR policy, workplace flexibility",
    description:
      "The Board approved amendments to Personnel Policy 4.12 establishing a standardized hybrid work schedule for eligible administrative staff. Employees may work remotely up to three days per week, with a minimum of two in-office days required for team collaboration. Department heads retain discretion to adjust schedules based on operational needs. The policy takes effect April 1, 2025, with a six-month review period. All remote work arrangements must be documented in writing and approved by direct supervisors.",
  },
  {
    decisionDate: new Date("2025-01-22"),
    title: "Authorization to Issue General Obligation Bonds — Series 2025A",
    subjectNames: ["Finance", "Development"],
    keywords: "bonds, capital improvement, infrastructure, debt issuance",
    description:
      "Pursuant to Resolution 2025-04, the Board authorized the issuance of up to $12.5 million in General Obligation Bonds, Series 2025A, for the Municipal Complex Renovation and Fire Station #3 construction projects. Bond proceeds will be used exclusively for capital improvements as outlined in the approved Capital Improvement Plan. The City Manager is directed to finalize bond terms with underwriters, targeting a competitive sale in Q2 2025. Annual debt service is estimated at $780,000 over a 20-year term.",
  },
  {
    decisionDate: new Date("2024-12-10"),
    title: "Appointment of Dr. Elena Vasquez to Board of Health",
    subjectNames: ["Governance", "BAM Committee"],
    keywords: "appointment, board of health, public health, governance",
    description:
      "The Board confirmed the appointment of Dr. Elena Vasquez, MD, MPH, to a four-year term on the Board of Health, effective January 1, 2025. Dr. Vasquez brings 18 years of experience in community health administration and currently serves as Director of Population Health at Regional Medical Center. She succeeds Dr. James Whitfield, whose term expired December 31, 2024. The appointment was recommended unanimously by the Nominating Committee following a public recruitment process with 7 qualified applicants.",
  },
  {
    decisionDate: new Date("2024-11-05"),
    title: "Sustainability Action Plan — Net Zero by 2040",
    subjectNames: ["Strategy", "Tangkis 2030"],
    keywords: "sustainability, climate, net zero, carbon reduction, green energy",
    description:
      "The Board adopted the Municipal Sustainability Action Plan establishing a goal of net-zero greenhouse gas emissions from municipal operations by 2040. Key milestones include: 50% reduction in fleet emissions by 2028, transition of all municipal buildings to renewable energy by 2032, and implementation of a comprehensive waste diversion program targeting 75% diversion by 2030. An initial allocation of $350,000 from the Green Fund is approved for Year 1 initiatives. Annual progress reports are required beginning Q4 2025.",
  },
  {
    decisionDate: new Date("2024-10-18"),
    title: "Contract Award — IT Infrastructure Managed Services",
    subjectNames: ["Commercial", "Administration"],
    keywords: "procurement, IT services, contract award, technology",
    description:
      "Following competitive bidding (RFP #2024-IT-007), the Board awarded a three-year contract to TechCore Solutions Inc. for managed IT infrastructure services at an annual cost not to exceed $425,000. The contract includes 24/7 network monitoring, cybersecurity threat management, cloud migration support, and help desk services for approximately 340 municipal employees. Two alternate bids were evaluated; TechCore scored highest on technical capability (92/100) and cost-effectiveness. Contract includes two optional one-year extensions.",
  },
  {
    decisionDate: new Date("2024-09-03"),
    title: "Zoning Amendment — Mixed-Use Development District 7",
    subjectNames: ["Development", "State BA"],
    keywords: "zoning, mixed-use, development, planning, ordinance",
    description:
      "The Board approved Ordinance 2024-18 amending the Unified Development Code to establish Mixed-Use Development District 7 (MUD-7) encompassing the 42-acre Riverside Corridor. The district permits residential densities up to 45 units per acre, ground-floor commercial use, and height limits of 75 feet. A 15% affordable housing set-aside is required for all residential projects exceeding 20 units. Public hearings were held on July 15 and August 12, 2024. The Planning Commission recommendation was adopted with minor clarifying amendments to parking requirements.",
  },
  {
    decisionDate: new Date("2024-07-25"),
    title: "Emergency Declaration — Severe Weather Response",
    subjectNames: ["Others", "Administration"],
    customSubject: "Emergency Management",
    keywords: "emergency, severe weather, disaster response, declaration",
    description:
      "In response to severe flooding affecting the eastern district, the Board declared a local state of emergency pursuant to Municipal Code Section 12.04. The declaration authorizes the Emergency Management Director to expend up to $500,000 from the contingency fund for immediate response operations, including evacuation support, temporary shelter activation, and infrastructure damage assessment. FEMA preliminary damage assessment teams are scheduled for August 5-7. The declaration remains in effect for 30 days unless extended by Board resolution.",
  },
  {
    decisionDate: new Date("2024-06-14"),
    title: "Employee Health Benefits Plan Renewal — 2024-2025",
    subjectNames: ["HR", "Allowances"],
    keywords: "benefits, health insurance, employees, HR, renewal",
    description:
      "The Board approved renewal of the group health benefits plan with Meridian Health Partners for the plan year beginning October 1, 2024. The municipality will continue to contribute 85% of employee premium costs and 75% of dependent coverage. Premium increases are capped at 4.1%, below the regional average of 6.8%. A new mental health wellness program and telehealth expansion are included at no additional cost. Open enrollment materials will be distributed to all eligible employees by August 15, 2024.",
  },
  {
    decisionDate: new Date("2024-05-08"),
    title: "National Junior Players Development Programme",
    subjectNames: [
      "National Junior Players",
      "Coach Education",
      "Development",
    ],
    keywords: "junior players, development, coaching, talent pipeline",
    description:
      "The Board approved the National Junior Players Development Programme for 2024–2026, allocating RM 2.4 million across coaching clinics, regional training camps, and performance analytics. The programme targets 120 identified junior athletes across all state associations, with quarterly assessment milestones aligned to the Tangkis 2030 strategic framework. Coach Education modules will be mandatory for all assigned development coaches. Progress reports are due to the BAM Committee each quarter.",
  },
];

async function main() {
  console.log("Seeding subjects...");

  for (const name of SUBJECT_NAMES) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Ensured ${SUBJECT_NAMES.length} subjects exist.`);

  console.log("Seeding decisions...");
  await prisma.decision.deleteMany();

  for (const decision of sampleDecisions) {
    const { subjectNames, customSubject, ...data } = decision;
    await prisma.decision.create({
      data: {
        ...data,
        createdBy: OWNER_EMAIL,
        customSubject: customSubject ?? null,
        subjects: {
          connect: subjectNames.map((name) => ({ name })),
        },
      },
    });
  }

  console.log(`Seeded ${sampleDecisions.length} decisions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
