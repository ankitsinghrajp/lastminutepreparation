export function parseSubject(subjectString) {
    if (!subjectString) return { mainSubject: "", bookName: "" };

    if (subjectString.includes(":")) {
        const parts = subjectString.split(":").map(p => p.trim().toLowerCase());
        return {
            mainSubject: parts[0] || "",
            bookName: parts[1] || ""
        };
    }

    return {
        mainSubject: subjectString.toLowerCase(),
        bookName: ""
    };
}

export function detectCategory(mainSubject) {
  // Pure language subjects
  const languageSubjects = [
    "hindi",
    "english", 
    "sanskrit", 

  ];

  // Pure science subjects
  const scienceSubjects = [
    "physics",
    "chemistry",
    "mathematics",
    "biology",
    "science",
    "computer science",
    "informatics practices",
    "applied mathematics",
    "bio technology",
    "CCT",
    "information and communication technology"

  ];

  // Commerce subjects
  const commerceSubjects = [
    "accountancy", 
    "business studies", 
    "economics",
    "business studies",

  ];
  
  const artsSubjects = [
     "history",
     "geography",
     "psychology",
     "sociology",
     "political science",
     "economics",
     "graphic design",
     "home science",
     "heritage crafts",
     "fine arts",
  ]

  // 1️⃣ If main subject is a language → ALWAYS language
  if (languageSubjects.includes(mainSubject)) {
    return "language";
  }

  // 2️⃣ If mainSubject belongs to science
  if (scienceSubjects.includes(mainSubject)) {
    return "science";
  }

  // 3️⃣ If belongs to commerce
  if (commerceSubjects.includes(mainSubject)) {
    return "commerce";
  }

  if (artsSubjects.includes(mainSubject)) {
    return "arts";
  }

  // 4️⃣ Everything else → humanities
  return "humanities";
}