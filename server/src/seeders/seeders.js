import mongoose from "mongoose";
import { ClassModel } from "../models/class.model.js"; // adjust path if needed


const classesData = {
  "classes": [
    {
      "class": "12th",
      "subjects": [
        // Physics
        {
          "subject": "Physics",
          "chapters": [
            {
              "chapter": "Electric Charges And Fields",
              "index": [
                "Introduction",
                "Electric Charge",
                "Conductors and Insulators",
                "Basic Properties of Electric Charge",
                "Coulomb's Law",
                "Forces between Multiple Charges",
                "Electric Field",
                "Electric Field Lines",
                "Electric Flux",
                "Electric Dipole",
                "Dipole in a Uniform External Field",
                "Continuous Charge Distribution",
                "Gauss's Law",
                "Applications of Gauss's Law"
              ]
            },
            {
              "chapter": "Electrostatic Potential And Capacitance",
              "index": [
                "Introduction",
                "Electrostatic Potential",
                "Potential due to a Point Charge",
                "Potential due to an Electric Dipole",
                "Potential due to a System of Charges",
                "Equipotential Surfaces",
                "Potential Energy of a System of Charges",
                "Potential Energy in an External Field",
                "Electrostatics of Conductors",
                "Dielectrics and Polarisation",
                "Capacitors and Capacitance",
                "The Parallel Plate Capacitor",
                "Effect of Dielectric on Capacitance",
                "Combination of Capacitors",
                "Energy Stored in a Capacitor"
              ]
            },
            {
              "chapter": "Current Electricity",
              "index": [
                "Introduction",
                "Electric Current",
                "Electric Currents in Conductors",
                "Ohm's law",
                "Drift of Electrons and the Origin of Resistivity",
                "Limitations of Ohm's Law",
                "Resistivity of Various Materials",
                "Temperature Dependence of Resistivity",
                "Electrical Energy, Power",
                "Cells, emf, Internal Resistance",
                "Cells in Series and in Parallel",
                "Kirchhoff's Rules",
                "Wheatstone Bridge"
              ]
            },
            {
              "chapter": "Moving Charges And Magnetism",
              "index": [
                "Introduction",
                "Magnetic Force",
                "Motion in a Magnetic Field",
                "Magnetic Field due to a Current Element, Biot-Savart Law",
                "Magnetic Field on the Axis of a Circular Current Loop",
                "Ampere's Circuital Law",
                "The Solenoid",
                "Force between Two Parallel Currents, the Ampere",
                "Torque on Current Loop, Magnetic Dipole",
                "The Moving Coil Galvanometer"
              ]
            },
            {
              "chapter": "Magnetism And Matter",
              "index": [
                "Introduction",
                "The Bar Magnet",
                "Magnetism and Gauss's Law",
                "Magnetisation and Magnetic Intensity",
                "Magnetic Properties of Materials"
              ]
            },
            {
              "chapter": "Electromagnetic Induction",
              "index": [
                "Introduction",
                "The Experiments of Faraday and Henry",
                "Magnetic Flux",
                "Faraday's Law of Induction",
                "Lenz's Law and Conservation of Energy",
                "Motional Electromotive Force",
                "Inductance",
                "AC Generator"
              ]
            },
            {
              "chapter": "Alternating Current",
              "index": [
                "Introduction",
                "AC Voltage Applied to a Resistor",
                "Representation of AC Current and Voltage by Rotating Vectors — Phasors",
                "AC Voltage Applied to an Inductor",
                "AC Voltage Applied to a Capacitor",
                "AC Voltage Applied to a Series LCR Circuit",
                "Power in AC Circuit: The Power Factor",
                "Transformers"
              ]
            },
            {
              "chapter": "Electromagnetic Waves",
              "index": [
                "Introduction",
                "Displacement Current",
                "Electromagnetic Waves",
                "Electromagnetic Spectrum"
              ]
            },
            {
              "chapter": "Ray Optics And Optical Instruments",
              "index": [
                "Introduction",
                "Reflection of Light by Spherical Mirrors",
                "Refraction",
                "Total Internal Reflection",
                "Refraction at Spherical Surfaces and by Lenses",
                "Refraction through a Prism",
                "Optical Instruments"
              ]
            },
            {
              "chapter": "Wave Optics",
              "index": [
                "Introduction",
                "Huygens Principle",
                "Refraction and Reflection of Plane Waves using Huygens Principle",
                "Coherent and Incoherent Addition of Waves",
                "Interference of Light Waves and Young's Experiment",
                "Diffraction",
                "Polarisation"
              ]
            },
            {
              "chapter": "Dual Nature Of Radiation And Matter",
              "index": [
                "Introduction",
                "Electron Emission",
                "Photoelectric Effect",
                "Experimental Study of Photoelectric Effect",
                "Photoelectric Effect and Wave Theory of Light",
                "Einstein's Photoelectric Equation: Energy Quantum of Radiation",
                "Particle Nature of Light: The Photon",
                "Wave Nature of Matter"
              ]
            },
            {
              "chapter": "Atoms",
              "index": [
                "Introduction",
                "Alpha-particle Scattering and Rutherford's Nuclear Model of Atom",
                "Atomic Spectra",
                "Bohr Model of the Hydrogen Atom",
                "The Line Spectra of the Hydrogen Atom",
                "DE Broglie's Explanation of Bohr's Second Postulate of Quantisation"
              ]
            },
            {
              "chapter": "Nuclei",
              "index": [
                "Introduction",
                "Atomic Masses and Composition of Nucleus",
                "Size of the Nucleus",
                "Mass-Energy and Nuclear Binding Energy",
                "Nuclear Force",
                "Radioactivity",
                "Nuclear Energy"
              ]
            },
            {
              "chapter": "Semiconductor Electronics: Materials, Devices And Simple Circuits",
              "index": [
                "Introduction",
                "Classification of Metals, Conductors and Semiconductors",
                "Intrinsic Semiconductor",
                "Extrinsic Semiconductor",
                "p-n Junction",
                "Semiconductor Diode",
                "Application of Junction Diode as a Rectifier"
              ]
            }
          ]
        },
        // Chemistry
        {
          "subject": "Chemistry",
          "chapters": [
            {
              "chapter": "Solutions",
              "index": [
                "Types of Solutions",
                "Expressing Concentration of Solutions",
                "Solubility",
                "Vapour Pressure of Liquid Solutions",
                "Ideal and Non-ideal Solutions",
                "Colligative Properties and Determination of Molar Mass",
                "Abnormal Molar Masses"
              ]
            },
            {
              "chapter": "Electrochemistry",
              "index": [
                "Electrochemical Cells",
                "Galvanic Cells",
                "Nernst Equation",
                "Conductance of Electrolytic Solutions",
                "Electrolytic Cells and Electrolysis",
                "Batteries",
                "Fuel Cells",
                "Corrosion"
              ]
            },
            {
              "chapter": "Chemical Kinetics",
              "index": [
                "Rate of a Chemical Reaction",
                "Factors Influencing Rate of a Reaction",
                "Integrated Rate Equations",
                "Temperature Dependence of the Rate of a Reaction",
                "Collision Theory of Chemical Reactions"
              ]
            },
            {
              "chapter": "The d-and f-Block Elements",
              "index": [
                "Position in the Periodic Table",
                "Electronic Configurations of the d-Block Elements",
                "General Properties of the Transition Elements (d-Block)",
                "Some Important Compounds of Transition Elements",
                "The Lanthanoids",
                "The Actinoids",
                "Some Applications of d- and f-Block Elements"
              ]
            },
            {
              "chapter": "Coordination Compounds",
              "index": [
                "Werner's Theory of Coordination Compounds",
                "Definitions of Some Important Terms Pertaining to Coordination Compounds",
                "Nomenclature of Coordination Compounds",
                "Isomerism in Coordination Compounds",
                "Bonding in Coordination Compounds",
                "Bonding in Metal Carbonyls",
                "Importance and Applications of Coordination Compounds"
              ]
            },
            {
              "chapter": "Haloalkanes and Haloarenes",
              "index": [
                "Classification",
                "Nomenclature",
                "Nature of C-X Bond",
                "Methods of Preparation of Haloalkanes",
                "Preparation of Haloarenes",
                "Physical Properties",
                "Chemical Reactions",
                "Polyhalogen Compounds"
              ]
            },
            {
              "chapter": "Alcohols, Phenols and Ethers",
              "index": [
                "Classification",
                "Nomenclature",
                "Structures of Functional Groups",
                "Alcohols and Phenols",
                "Some Commercially Important Alcohols",
                "Ethers"
              ]
            },
            {
              "chapter": "Aldehydes, Ketones and Carboxylic Acids",
              "index": [
                "Nomenclature and Structure of Carbonyl Group",
                "Preparation of Aldehydes and Ketones",
                "Physical Properties",
                "Chemical Reactions",
                "Uses of Aldehydes and Ketones",
                "Nomenclature and Structure of Carboxyl Group",
                "Methods of Preparation of Carboxylic Acids",
                "Physical Properties",
                "Chemical Reactions",
                "Uses of Carboxylic Acids"
              ]
            },
            {
              "chapter": "Amines",
              "index": [
                "Structure of Amines",
                "Classification",
                "Nomenclature",
                "Preparation of Amines",
                "Physical Properties",
                "Chemical Reactions",
                "Method of Preparation of Diazonium Salts",
                "Physical Properties",
                "Chemical Reactions",
                "Importance of Diazonium Salts in Synthesis of Aromatic Compounds"
              ]
            },
            {
              "chapter": "Biomolecules",
              "index": [
                "Carbohydrates",
                "Proteins",
                "Enzymes",
                "Vitamins",
                "Nucleic Acids",
                "Hormones"
              ]
            }
          ]
        },
        // Biology
        {
          "subject": "Biology",
          "chapters": [
            {
              "chapter": "Sexual Reproduction in Flowering Plants",
              "index": []
            },
            {
              "chapter": "Human Reproduction",
              "index": []
            },
            {
              "chapter": "Reproductive Health",
              "index": []
            },
            {
              "chapter": "Principles of Inheritance and Variation",
              "index": []
            },
            {
              "chapter": "Molecular Basis of Inheritance",
              "index": []
            },
            {
              "chapter": "Evolution",
              "index": []
            },
            {
              "chapter": "Human Health and Disease",
              "index": []
            },
            {
              "chapter": "Microbes in Human Welfare",
              "index": []
            },
            {
              "chapter": "Biotechnology: Principles and Processes",
              "index": []
            },
            {
              "chapter": "Biotechnology and its Applications",
              "index": []
            },
            {
              "chapter": "Organisms and Populations",
              "index": []
            },
            {
              "chapter": "Ecosystem",
              "index": []
            },
            {
              "chapter": "Biodiversity and Conservation",
              "index": []
            }
          ]
        },
        // Accountacy
        {
          "subject": "Accountancy",
          "chapters": [
            {
              "chapter": "Accounting for Not-for-Profit Organisation",
              "index": []
            },
            {
              "chapter": "Accounting for Partnership: Basic Concepts",
              "index": [
                "Nature of Partnership",
                "Partnership Deed",
                "Special Aspects of Partnership Accounts",
                "Maintenance of Capital Accounts of Partners",
                "Distribution of Profit among Partners",
                "Guarantee of Profit to a Partner",
                "Past Adjustments"
              ]
            },
            {
              "chapter": "Reconstitution of a Partnership Firm – Admission of a Partner",
              "index": [
                "Modes of Reconstitution of a Partnership Firm",
                "Admission of a New Partner",
                "New Profit Sharing Ratio",
                "Sacrificing Ratio",
                "Goodwill",
                "Adjustment for Accumulated Profits and Losses",
                "Revaluation of Assets and Reassessment of Liabilities",
                "Adjustment of Capitals",
                "Change in Profit Sharing Ratio among the Existing Partners"
              ]
            },
            {
              "chapter": "Reconstitution of a Partnership Firm – Retirement/Death of a Partner",
              "index": [
                "Ascertaining the Amount Due to Retiring/Deceased Partner",
                "New Profit Sharing Ratio",
                "Gaining Ratio",
                "Treatment of Goodwill",
                "Adjustment for Revaluation of Assets and Liabilities",
                "Adjustment of Accumulated Profits and Losses",
                "Disposal of Amount Due to Retiring Partner",
                "Adjustment of Partners' Capitals",
                "Death of a Partner"
              ]
            },
            {
              "chapter": "Dissolution of Partnership Firm",
              "index": [
                "Dissolution of Partnership",
                "Dissolution of a Firm",
                "Settlement of Accounts",
                "Accounting Treatment"
              ]
            },
            {
              "chapter": "Accounting for Share Capital",
              "index": [
                "Features of a Company",
                "Kinds of Companies",
                "Share Capital of a Company",
                "Nature and Classes of Shares",
                "Issue of Shares",
                "Accounting Treatment",
                "Forfeiture of Shares"
              ]
            },
            {
              "chapter": "Issue and Redemption of Debentures",
              "index": [
                "Meaning of Debentures",
                "Distinction between Shares and Debentures",
                "Types of Debentures",
                "Issue of Debentures",
                "Over Subscription",
                "Issue of Debentures for Consideration other than Cash",
                "Issue of Debentures as a Collateral Security",
                "Terms of Issue of Debentures",
                "Interest on Debentures",
                "Writing off Discount/Loss on Issue of Debentures",
                "Redemption of Debentures",
                "Redemption by Payment in Lump Sum",
                "Redemption by Purchase in Open Market",
                "Redemption by Conversion"
              ]
            },
            {
              "chapter": "Financial Statements of a Company",
              "index": [
                "Meaning of Financial Statements",
                "Nature of Financial Statements",
                "Objectives of Financial Statements",
                "Types of Financial Statements",
                "Uses and Importance of Financial Statements",
                "Limitations of Financial Statements"
              ]
            },
            {
              "chapter": "Analysis of Financial Statements",
              "index": [
                "Meaning of Analysis of Financial Statements",
                "Significance of Analysis of Financial Statements",
                "Objectives of Analysis of Financial Statements",
                "Tools of Analysis of Financial Statements",
                "Comparative Statements",
                "Common Size Statement",
                "Limitations of Financial Analysis"
              ]
            },
            {
              "chapter": "Accounting Ratios",
              "index": [
                "Meaning of Accounting Ratios",
                "Objectives of Ratio Analysis",
                "Advantages of Ratio Analysis",
                "Limitations of Ratio Analysis",
                "Types of Ratios",
                "Liquidity Ratios",
                "Solvency Ratios",
                "Activity (or Turnover) Ratio",
                "Profitability Ratios"
              ]
            },
            {
              "chapter": "Cash Flow Statement",
              "index": [
                "Objectives of Cash Flow Statement",
                "Benefits of Cash Flow Statement",
                "Cash and Cash Equivalents",
                "Cash Flows",
                "Classification of Activities for the Preparation of Cash Flow Statement",
                "Ascertaining Cash Flow from Operating Activities",
                "Ascertainment of Cash Flow from Investing and Financing Activities",
                "Preparation of Cash Flow Statement"
              ]
            }
          ]
        },
        // Mathematics
        {
"subject": "Mathematics",
"chapters": [
{
"chapter": "Relations and Functions",
"index": [
"Introduction",
"Types of Relations",
"Types of Functions",
"Composition of Functions and Invertible Function"
]
},
{
"chapter": "Inverse Trigonometric Functions",
"index": [
"Introduction",
"Basic Concepts",
"Properties of Inverse Trigonometric Functions"
]
},
{
"chapter": "Matrices",
"index": [
"Introduction",
"Matrix",
"Types of Matrices",
"Operations on Matrices",
"Transpose of a Matrix",
"Symmetric and Skew Symmetric Matrices",
"Invertible Matrices"
]
},
{
"chapter": "Determinants",
"index": [
"Introduction",
"Determinant",
"Area of a Triangle",
"Minors and Cofactors",
"Adjoint and Inverse of a Matrix",
"Applications of Determinants and Matrices"
]
},
{
"chapter": "Continuity and Differentiability",
"index": [
"Introduction",
"Continuity",
"Differentiability",
"Exponential and Logarithmic Functions",
"Logarithmic Differentiation",
"Derivatives of Functions in Parametric Forms",
"Second Order Derivative"
]
},
{
"chapter": "Application of Derivatives",
"index": [
"Introduction",
"Rate of Change of Quantities",
"Increasing and Decreasing Functions",
"Maxima and Minima"
]
},
{
"chapter": "Proofs in Mathematics",
"index": [
"Introduction",
"What is a Proof?"
]
},
{
"chapter": "Mathematical Modelling",
"index": [
"Introduction",
"Why Mathematical Modelling?",
"Principles of Mathematical Modelling"
]
},
{
"chapter": "Integrals",
"index": [
"Introduction",
"Integration as an Inverse Process of Differentiation",
"Methods of Integration",
"Integrals of Some Particular Functions",
"Integration by Partial Fractions",
"Integration by Parts",
"Definite Integral",
"Fundamental Theorem of Calculus",
"Evaluation of Definite Integrals by Substitution",
"Some Properties of Definite Integrals"
]
},
{
"chapter": "Application of Integrals",
"index": [
"Introduction",
"Area under Simple Curves"
]
},
{
"chapter": "Differential Equations",
"index": [
"Introduction",
"Basic Concepts",
"General and Particular Solutions of a Differential Equation",
"Methods of Solving First Order, First Degree Differential Equations"
]
},
{
"chapter": "Vector Algebra",
"index": [
"Introduction",
"Some Basic Concepts",
"Types of Vectors",
"Addition of Vectors",
"Multiplication of a Vector by a Scalar",
"Product of Two Vectors"
]
},
{
"chapter": "Three Dimensional Geometry",
"index": [
"Introduction",
"Direction Cosines and Direction Ratios of a Line",
"Equation of a Line in Space",
"Angle between Two Lines",
"Shortest Distance between Two Lines"
]
},
{
"chapter": "Linear Programming",
"index": [
"Introduction",
"Linear Programming Problem and its Mathematical Formulation"
]
},
{
"chapter": "Probability",
"index": [
"Introduction",
"Conditional Probability",
"Multiplication Theorem on Probability",
"Independent Events",
"Bayes' Theorem"
]
}
]
        },
        // History 3 parts 
        {
"subject": "Themes in Indian History Part 1",
"chapters": [
{
"chapter": "BRICKS, BEADS AND BONES: The Harappan Civilisation",
"index": []
},
{
"chapter": "KINGS, FARMERS AND TOWNS: Early States and Economics (c.600 BCE-600 CE)",
"index": []
},
{
"chapter": "KINSHIP, CASTE AND CLASS: Early Societies (c.600 BCE-600 CE)",
"index": []
},
{
"chapter": "THINKERS, BELIEFS AND BUILDINGS: Cultural Developments (c.600 BCE-600 CE)",
"index": []
}
]
        },
        {
"subject": "Themes in Indian History Part 2",
"chapters": [
{
"chapter": "THROUGH THE EYES OF TRAVELLERS: Perceptions of Society (c. tenth to seventeenth century)",
"index": []
},
{
"chapter": "BHAKTI-SUFI TRADITIONS: Changes in Religious Beliefs and Devotional Texts (c. eighth to eighteenth century)",
"index": []
},
{
"chapter": "AN IMPERIAL CAPITAL: VIJAYANAGARA (c. fourteenth to sixteenth century)",
"index": []
},
{
"chapter": "PEASANTS, ZAMINDARS AND THE STATE: Agrarian Society and the Mughal Empire (c. sixteenth-seventeenth centuries)",
"index": []
}
]
        },
        {
"subject": "Themes in Indian History Part 3",
"chapters": [
{
"chapter": "COLONIALISM AND THE COUNTRYSIDE: Exploring Official Archives",
"index": []
},
{
"chapter": "REBELS AND THE RAJ: The Revolt of 1857 and Its Representations",
"index": []
},
{
"chapter": "MAHATMA GANDHI AND THE NATIONALIST MOVEMENT: Civil Disobedience and Beyond",
"index": []
},
{
"chapter": "FRAMING THE CONSTITUTION: The Beginning of a New Era",
"index": []
}
]
        },
        // Sanskrit Bhaswati
        {
  "subject": "Sanskrit: Bhaswati",
  "chapters": [
    {
      "chapter": "प्रथमः पाठः - अनुशासनम्",
      "index": []
    },
    {
      "chapter": "द्वितीयः पाठः - मातुराज्ञा गरीयसी",
      "index": []
    },
    {
      "chapter": "तृतीयः पाठः - प्रजानुरञ्जको नृपः",
      "index": []
    },
    {
      "chapter": "चतुर्थः पाठः - द्वारिकस्य निष्ठा",
      "index": []
    },
    {
      "chapter": "पञ्चमः पाठः - सूक्ति-सौरभम्",
      "index": []
    },
    {
      "chapter": "षष्ठः पाठः - नैकेनापि समं गता वसुमती",
      "index": []
    },
    {
      "chapter": "सप्तमः पाठः - हल्दीघाटी",
      "index": []
    },
    {
      "chapter": "अष्टमः पाठः - मदालसा",
      "index": []
    },
    {
      "chapter": "नवमः पाठः - कार्याकार्यव्यवस्थितिः",
      "index": []
    },
    {
      "chapter": "दशमः पाठः - विद्यास्थानानि",
      "index": []
    },
    {
      "chapter": "परिशिष्ट - अनुशंसित ग्रन्थ",
      "index": []
    }
  ]
        },
        // Sanskrit Shaswati
        {
  "subject": "Sanskrit: Shaswati",
  "chapters": [
    {
      "chapter": "प्रथमः पाठः - विद्यया अमृतमश्नुते",
      "index": []
    },
    {
      "chapter": "द्वितीयः पाठः - रघुकौत्ससंवादः",
      "index": []
    },
    {
      "chapter": "तृतीयः पाठः - बालकौतुकम्",
      "index": []
    },
    {
      "chapter": "चतुर्थः पाठः - कर्मगौरवम्",
      "index": []
    },
    {
      "chapter": "पञ्चमः पाठः - शुकनासोपदेशः",
      "index": []
    },
    {
      "chapter": "षष्ठः पाठः - सूक्तिसुधा",
      "index": []
    },
    {
      "chapter": "सप्तमः पाठः - विक्रमस्यौदार्यम्",
      "index": []
    },
    {
      "chapter": "अष्टमः पाठः - कायं वा साध्येयं देहं वा पातयेयम्",
      "index": []
    },
    {
      "chapter": "नवमः पाठः - दीनबन्धुः श्रीनायरः",
      "index": []
    },
    {
      "chapter": "दशमः पाठः - योगस्य वैशिष्ट्यम्",
      "index": []
    },
    {
      "chapter": "एकादशः पाठः - कथं शब्दानुशासनं कर्तव्यम्",
      "index": []
    },
    {
      "chapter": "परिशिष्ट - छन्द",
      "index": []
    },
    {
      "chapter": "परिशिष्ट - अलङ्कार",
      "index": []
    },
    {
      "chapter": "परिशिष्ट - अनुशंसित ग्रन्थ",
      "index": []
    }
  ]
        },
        // Sanskrit Sahitya 
        {
  "subject": "Sanskrit Sahitya - Parichay",
  "chapters": [
    {
      "chapter": "प्रथम अध्याय - संस्कृत भाषा—उद्भव एवं विकास",
      "index": []
    },
    {
      "chapter": "द्वितीय अध्याय - वैदिक साहित्य",
      "index": []
    },
    {
      "chapter": "तृतीय अध्याय - रामायण, महाभारत एवं पुराण",
      "index": []
    },
    {
      "chapter": "चतुर्थ अध्याय - महाकाव्य",
      "index": []
    },
    {
      "chapter": "पञ्चम अध्याय - ऐतिहासिक महाकाव्य",
      "index": []
    },
    {
      "chapter": "षष्ठ अध्याय - काव्य की अन्य विधाएँ",
      "index": []
    },
    {
      "chapter": "सप्तम अध्याय - गद्यकाव्य एवं चम्पूकाव्य",
      "index": []
    },
    {
      "chapter": "अष्टम अध्याय - कथा साहित्य",
      "index": []
    },
    {
      "chapter": "नवम अध्याय - नाट्य–साहित्य",
      "index": []
    },
    {
      "chapter": "दशम अध्याय - आधुनिक संस्कृत साहित्य",
      "index": []
    },
    {
      "chapter": "एकादश अध्याय - संस्कृत कवयित्रियाँ",
      "index": []
    },
    {
      "chapter": "द्वादश अध्याय - शास्त्रीय साहित्य",
      "index": []
    },
    {
      "chapter": "परिशिष्ट I - लेखानुक्रमणिका",
      "index": []
    },
    {
      "chapter": "परिशिष्ट II - ग्रन्थानुक्रमणिका",
      "index": []
    },
    {
      "chapter": "परिशिष्ट III - ग्रन्थ एवं ग्रन्थकारों की कालक्रमसारिणी",
      "index": []
    },
    {
      "chapter": "परिशिष्ट IV - संस्कृतपत्रिकाणाम् अनुक्रमणिका",
      "index": []
    },
    {
      "chapter": "परिशिष्ट V - अनुशंसित पुस्तकों की सूची",
      "index": []
    }
  ]
        },
        // Hindi Antara Part 2
        {
  "subject": "Hindi: Antara Part 2",
  "chapters": [
    {
      "chapter": "देवसेना का गीत / कार्नेलिया का गीत",
      "index": []
    },
    {
      "chapter": "सरोज स्मृति",
      "index": []
    },
    {
      "chapter": "यह दीप अकेला / मैंने देखा, एक बूँद",
      "index": []
    },
    {
      "chapter": "बनारस / दिशा",
      "index": []
    },
    {
      "chapter": "वसंत आया / तोड़ो",
      "index": []
    },
    {
      "chapter": "भरत-राम का प्रेम / पद",
      "index": []
    },
    {
      "chapter": "बारहमासा",
      "index": []
    },
    {
      "chapter": "पद",
      "index": []
    },
    {
      "chapter": "कवित्त",
      "index": []
    },
    {
      "chapter": "प्रेमघन की छाया - स्मृति",
      "index": []
    },
    {
      "chapter": "सुमिरिनी के मनके",
      "index": []
    },
    {
      "chapter": "संवदिया",
      "index": []
    },
    {
      "chapter": "गांधी, नेहरू और यास्सेर अराफात",
      "index": []
    },
    {
      "chapter": "शेर / पहचान / चार हाथ / साझा",
      "index": []
    },
    {
      "chapter": "जहाँ कोई वापसी नहीं",
      "index": []
    },
    {
      "chapter": "दूसरा देवदास",
      "index": []
    },
    {
      "chapter": "कुटज",
      "index": []
    }
  ]
        },
        // Hindi Aaroh Part 2
        {
  "subject": "Hindi: Aaroh Part 2",
  "chapters": [
    {
      "chapter": "आत्मपरिचय / एक गीत",
      "index": []
    },
    {
      "chapter": "पतंग",
      "index": []
    },
    {
      "chapter": "कविता के बहाने / बात सीधी थी पर",
      "index": []
    },
    {
      "chapter": "कैमरे में बंद अपाहिज",
      "index": []
    },
    {
      "chapter": "उषा",
      "index": []
    },
    {
      "chapter": "बादल राग",
      "index": []
    },
    {
      "chapter": "कवितावली (उत्तर कांड से) / लक्ष्मण-मूर्छा और राम का विलाप",
      "index": []
    },
    {
      "chapter": "रुबाइयाँ",
      "index": []
    },
    {
      "chapter": "छोटा मेरा खेत / बगुलों के पंख",
      "index": []
    },
    {
      "chapter": "भक्तिन",
      "index": []
    },
    {
      "chapter": "बाज़ार दर्शन",
      "index": []
    },
    {
      "chapter": "काले मेघा पानी दे",
      "index": []
    },
    {
      "chapter": "पहलवान की ढोलक",
      "index": []
    },
    {
      "chapter": "शिरीष के फूल",
      "index": []
    },
    {
      "chapter": "श्रम विभाजन और जाति-प्रथा / मेरी कल्पना का आदर्श समाज",
      "index": []
    }
  ]
        },
        // Hindi Vitan Part 2
        {
  "subject": "Hindi: Vitan Part 2",
  "chapters": [
    {
      "chapter": "सिल्वर वैडिंग",
      "index": []
    },
    {
      "chapter": "जूझ",
      "index": []
    },
    {
      "chapter": "अतीत में दबे पाँव",
      "index": []
    },
    {
      "chapter": "लेखक परिचय",
      "index": []
    }
  ]
        },
        // Hindi Antaral Part 2
        {
  "subject": "Hindi: Antaral Part 2",
  "chapters": [
    {
      "chapter": "सूरदास की झोंपड़ी",
      "index": []
    },
    {
      "chapter": "बिस्कोहर की माटी",
      "index": []
    },
    {
      "chapter": "अपना मालवा खाऊ-उजाड़ू सभ्यता में",
      "index": []
    }
  ]
        },
        // Hindi Abhivyakti Aur Madhyam
        {
  "subject": "Hindi: Abhivyakti aur madhyam",
  "chapters": [
    {
      "chapter": "जनसंचार माध्यम",
      "index": []
    },
    {
      "chapter": "पत्रकारिता के विविध आयाम",
      "index": []
    },
    {
      "chapter": "विभिन्न माध्यमों के लिए लेखन",
      "index": []
    },
    {
      "chapter": "पत्रकारीय लेखन के विभिन्न रूप और लेखन प्रक्रिया",
      "index": []
    },
    {
      "chapter": "विशेष लेखन—स्वरूप और प्रकार",
      "index": []
    },
    {
      "chapter": "कैसे बनती है कविता",
      "index": []
    },
    {
      "chapter": "नाटक लिखने का व्याकरण",
      "index": []
    },
    {
      "chapter": "कैसे लिखें कहानी",
      "index": []
    },
    {
      "chapter": "डायरी लिखने की कला",
      "index": []
    },
    {
      "chapter": "कथा-पटकथा",
      "index": []
    },
    {
      "chapter": "कैसे करें कहानी का नाट्य रूपांतरण",
      "index": []
    },
    {
      "chapter": "कैसे बनता है रेडियो नाटक",
      "index": []
    },
    {
      "chapter": "नए और अप्रत्याशित विषयों पर लेखन",
      "index": []
    },
    {
      "chapter": "कार्यालयी लेखन और प्रक्रिया",
      "index": []
    },
    {
      "chapter": "स्ववृत्त (बायोडेटा) लेखन और रोजगार संबंधी आवेदन पत्र",
      "index": []
    },
    {
      "chapter": "कोश—एक परिचय",
      "index": []
    }
  ]
        },
        // English Kaleidoscope
        {
    "subject": "English: Kaleidoscope",
  "chapters": [
    {
      "chapter": "I Sell my Dreams",
      "index": []
    },
    {
      "chapter": "Eveline",
      "index": []
    },
    {
      "chapter": "A Wedding in Brownsville",
      "index": []
    },
    {
      "chapter": "Tomorrow",
      "index": []
    },
    {
      "chapter": "One Centimetre",
      "index": []
    },
    {
      "chapter": "A Lecture Upon the Shadow",
      "index": []
    },
    {
      "chapter": "Poems by Milton",
      "index": []
    },
    {
      "chapter": "Poems by Blake",
      "index": []
    },
    {
      "chapter": "Kubla Khan",
      "index": []
    },
    {
      "chapter": "Trees",
      "index": []
    },
    {
      "chapter": "The Wild Swans at Coole",
      "index": []
    },
    {
      "chapter": "Time and Time Again",
      "index": []
    },
    {
      "chapter": "Blood",
      "index": []
    },
    {
      "chapter": "Freedom",
      "index": []
    },
    {
      "chapter": "The Mark on the Wall",
      "index": []
    },
    {
      "chapter": "Film-making",
      "index": []
    },
    {
      "chapter": "Why the Novel Matters",
      "index": []
    },
    {
      "chapter": "The Argumentative Indian",
      "index": []
    },
    {
      "chapter": "On Science Fiction",
      "index": []
    },
    {
      "chapter": "Chandalika",
      "index": []
    },
    {
      "chapter": "Broken Images",
      "index": []
    }
  ]
        },
        // English: Flamingo
        {
  "subject": "English: Flamingo",
  "chapters": [
    {
      "chapter": "The Last Lesson",
      "index": []
    },
    {
      "chapter": "Lost Spring",
      "index": []
    },
    {
      "chapter": "Deep Water",
      "index": []
    },
    {
      "chapter": "The Ratrap",
      "index": []
    },
    {
      "chapter": "Indigo",
      "index": []
    },
    {
      "chapter": "Poets and Pancakes",
      "index": []
    },
    {
      "chapter": "The Interview",
      "index": []
    },
    {
      "chapter": "Going Places",
      "index": []
    },
    {
      "chapter": "My Mother at Sixty-six",
      "index": []
    },
    {
      "chapter": "Keeping Quiet",
      "index": []
    },
    {
      "chapter": "A Thing of Beauty",
      "index": []
    },
    {
      "chapter": "A Roadside Stand",
      "index": []
    },
    {
      "chapter": "Aunt Jennifer's Tigers",
      "index": []
    }
  ]
        },
        // English Vistas
        {
  "subject": "English: Vistas",
  "chapters": [
    {
      "chapter": "The Third Level",
      "index": []
    },
    {
      "chapter": "The Tiger King",
      "index": []
    },
    {
      "chapter": "Journey to the end of the Earth",
      "index": []
    },
    {
      "chapter": "The Enemy",
      "index": []
    },
    {
      "chapter": "On the face of It",
      "index": []
    },
    {
      "chapter": "Memories of Childhood",
      "index": [
        "The Cutting of My Long Hair",
        "We Too are Human Beings"
      ]
    }
  ]
        },
        // Geography: Fundamentals Of Human Geography
        {
"subject": "Geography: Fundamentals Of Human Geography",
"chapters": [
{
"chapter": "UNIT I",
"index": [
"Human Geography Nature and Scope"
]
},
{
"chapter": "UNIT II",
"index": [
"The World Population Distribution, Density and Growth",
"Human Development"
]
},
{
"chapter": "UNIT III",
"index": [
"Primary Activities",
"Secondary Activities",
"Tertiary and Quaternary Activities",
"Transport and Communication",
"International Trade"
]
}
]
        },
        // Geography: People And Economy 
        {
"subject": "Geography: People And Economy",
"chapters": [
{
"chapter": "UNIT I",
"index": [
"Population : Distribution, Density, Growth and Composition"
]
},
{
"chapter": "UNIT II",
"index": [
"Human Settlements"
]
},
{
"chapter": "UNIT III",
"index": [
"Land Resources and Agriculture",
"Water Resources",
"Mineral and Energy Resources",
"Planning and Sustainable Development in Indian Context"
]
},
{
"chapter": "UNIT IV",
"index": [
"Transport and Communication",
"International Trade"
]
},
{
"chapter": "UNIT V",
"index": [
"Geographical Perspective on Selected Issues and Problems"
]
}
]
        },
        // Geography: Practical Work in Geography
        {
"subject": "Geography: Practical Work in Geography",
"chapters": [
{
"chapter": "Data – Its Source and Compilation",
"index": []
},
{
"chapter": "Data Processing",
"index": []
},
{
"chapter": "Graphical Representation of Data",
"index": []
},
{
"chapter": "Spatial Information Technology",
"index": []
}
]
        },
        // Psychology
        {
  "subject": "Psychology",
  "chapters": [
    {
      "chapter": "Variations in Psychological Attributes",
      "index": []
    },
    {
      "chapter": "Self and Personality",
      "index": []
    },
    {
      "chapter": "Meeting Life Challenges",
      "index": []
    },
    {
      "chapter": "Psychological Disorders",
      "index": []
    },
    {
      "chapter": "Therapeutic Approaches",
      "index": []
    },
    {
      "chapter": "Attitude and Social Cognition",
      "index": []
    },
    {
      "chapter": "Social Influence and Group Processes",
      "index": []
    }
  ]
        },
        // Sociology: Indian Society
        {
  "subject": "Sociology: Indian Society",
  "chapters": [
    {
      "chapter": "Introducing Indian Society",
      "index": []
    },
    {
      "chapter": "The Demographic Structure of the Indian Society",
      "index": []
    },
    {
      "chapter": "Social Institutions: Continuity and Change",
      "index": []
    },
    {
      "chapter": "The Market as a Social Institution",
      "index": []
    },
    {
      "chapter": "Patterns of Social Inequality and Exclusion",
      "index": []
    },
    {
      "chapter": "The Challenges of Cultural Diversity",
      "index": []
    },
    {
      "chapter": "Suggestions for Project Work",
      "index": []
    }
  ]
        },
        // Sociology: Social Change and Development in India
        {
  "subject": "Sociology: Social Change and Development in India",
  "chapters": [
    {
      "chapter": "Structural Change",
      "index": []
    },
    {
      "chapter": "Cultural Change",
      "index": []
    },
    {
      "chapter": "The Constitution and Social Change",
      "index": []
    },
    {
      "chapter": "Change and Development in Rural Society",
      "index": []
    },
    {
      "chapter": "Change and Development in Industrial Society",
      "index": []
    },
    {
      "chapter": "Globalisation and Social Change",
      "index": []
    },
    {
      "chapter": "Mass Media and Communications",
      "index": []
    },
    {
      "chapter": "Social Movements",
      "index": []
    }
  ]
        },
        // Political Science: Contemporary World Politics
        {
  "subject": "Political Science: Contemporary World Politics",
  "chapters": [
    {
      "chapter": "The End of Bipolarity",
      "index": []
    },
    {
      "chapter": "Contemporary Centres of Power",
      "index": []
    },
    {
      "chapter": "Contemporary South Asia",
      "index": []
    },
    {
      "chapter": "International Organisations",
      "index": []
    },
    {
      "chapter": "Security in the Contemporary World",
      "index": []
    },
    {
      "chapter": "Environment and Natural Resources",
      "index": []
    },
    {
      "chapter": "Globalisation",
      "index": []
    }
  ]
        },
        // Political Science: Politics in India since Independence
        {
  "subject": "Political Science: Politics in India since Independence",
  "chapters": [
    {
      "chapter": "Challenges of Nation Building",
      "index": []
    },
    {
      "chapter": "Era of One-party Dominance",
      "index": []
    },
    {
      "chapter": "Politics of Planned Development",
      "index": []
    },
    {
      "chapter": "India's External Relations",
      "index": []
    },
    {
      "chapter": "Challenges to and Restoration of the Congress System",
      "index": []
    },
    {
      "chapter": "The Crisis of Democratic Order",
      "index": []
    },
    {
      "chapter": "Regional Aspirations",
      "index": []
    },
    {
      "chapter": "Recent Developments in Indian Politics",
      "index": []
    }
  ]
        },
        // Economics: Microeconomics
        {
  "subject": "Economics: Microeconomics",
  "chapters": [
    {
      "chapter": "Introduction",
      "index": [
        "A Simple Economy",
        "Central Problems of an Economy",
        "Organisation of Economic Activities",
        "The Centrally Planned Economy",
        "The Market Economy",
        "Positive and Normative Economics",
        "Microeconomics and Macroeconomics",
        "Plan of the Book"
      ]
    },
    {
      "chapter": "Theory of Consumer Behaviour",
      "index": [
        "Utility",
        "Cardinal Utility Analysis",
        "Ordinal Utility Analysis",
        "The Consumer's Budget",
        "Budget Set and Budget Line",
        "Changes in the Budget Set",
        "Optimal Choice of the Consumer",
        "Demand",
        "Demand Curve and the Law of Demand",
        "Deriving a Demand Curve from Indifference Curves and Budget Constraints",
        "Normal and Inferior Goods",
        "Substitutes and Complements",
        "Shifts in the Demand Curve",
        "Movements along the Demand Curve and Shifts in the Demand Curve",
        "Market Demand",
        "Elasticity of Demand",
        "Elasticity along a Linear Demand Curve",
        "Factors Determining Price Elasticity of Demand for a Good",
        "Elasticity and Expenditure"
      ]
    },
    {
      "chapter": "Production and Costs",
      "index": [
        "Production Function",
        "The Short Run and the Long Run",
        "Total Product, Average Product and Marginal Product",
        "Total Product",
        "Average Product",
        "Marginal Product",
        "The Law of Diminishing Marginal Product and the Law of Variable Proportions",
        "Shapes of Total Product, Marginal Product and Average Product Curves",
        "Returns to Scale",
        "Costs",
        "Short Run Costs",
        "Long Run Costs"
      ]
    },
    {
      "chapter": "The Theory of the Firm under Perfect Competition",
      "index": [
        "Perfect Competition: Defining Features",
        "Revenue",
        "Profit Maximisation",
        "Condition 1",
        "Condition 2",
        "Condition 3",
        "The Profit Maximisation Problem: Graphical Representation",
        "Supply Curve of a Firm",
        "Short Run Supply Curve of a Firm",
        "Long Run Supply Curve of a Firm",
        "The Shut Down Point",
        "The Normal Profit and Break-even Point",
        "Determinants of a Firm's Supply Curve",
        "Technological Progress",
        "Input Prices",
        "Market Supply Curve",
        "Price Elasticity of Supply"
      ]
    },
    {
      "chapter": "Market Equilibrium",
      "index": [
        "Equilibrium, Excess Demand, Excess Supply",
        "Market Equilibrium: Fixed Number of Firms",
        "Market Equilibrium: Free Entry and Exit",
        "Applications",
        "Price Ceiling",
        "Price Floor"
      ]
    }
  ]
        },
        // Economics: Macroeconomics
        {
  "subject": "Economics: Macroeconomics",
  "chapters": [
    {
      "chapter": "Introduction",
      "index": [
        "Emergence of Macroeconomics",
        "Context of the Present Book of Macroeconomics"
      ]
    },
    {
      "chapter": "National Income Accounting",
      "index": [
        "Some Basic Concepts of Macroeconomics",
        "Circular Flow of Income and Methods of Calculating National Income",
        "The Product or Value Added Method",
        "Expenditure Method",
        "Income Method",
        "Factor Cost, Basic Prices and Market Prices"
      ]
    },
    {
      "chapter": "Money and Banking",
      "index": [
        "Functions of Money",
        "Demand for Money and Supply of Money",
        "Demand for Money",
        "Supply of Money"
      ]
    },
    {
      "chapter": "Determination of Income and Employment",
      "index": [
        "Aggregate Demand and its Components",
        "Consumption",
        "Investment",
        "Determination of Income in Two-sector Model",
        "Determination of Equilibrium Income in the Short Run",
        "Macroeconomic equilibrium with price level fixed",
        "Effect of an autonomous change in aggregate demand on income and output",
        "The Multiplier Mechanism",
        "Some More Concepts"
      ]
    },
    {
      "chapter": "Government Budget and the Economy",
      "index": [
        "Government Budget - Meaning and its Components",
        "Objectives of Government Budget",
        "Classification of Receipts",
        "Classification of Expenditure",
        "Balanced, Surplus and Deficit Budget",
        "Measures of Government Deficit"
      ]
    },
    {
      "chapter": "Open Economy Macroeconomics",
      "index": [
        "The Balance of Payments",
        "Current Account",
        "Capital Account",
        "Balance of Payments Surplus and Deficit",
        "The Foreign Exchange Market",
        "Foreign Exchange Rate",
        "Determination of the Exchange Rate",
        "Merits and Demerits of Flexible and Fixed Exchange Rate Systems",
        "Managed Floating"
      ]
    }
  ]
        },
        // Business Studies
        {
  "subject": "Business Studies",
  "chapters": [
    {
      "chapter": "Nature and Significance of Management",
      "index": []
    },
    {
      "chapter": "Principles of Management",
      "index": []
    },
    {
      "chapter": "Business Environment",
      "index": []
    },
    {
      "chapter": "Planning",
      "index": []
    },
    {
      "chapter": "Organising",
      "index": []
    },
    {
      "chapter": "Staffing",
      "index": []
    },
    {
      "chapter": "Directing",
      "index": []
    },
    {
      "chapter": "Controlling",
      "index": []
    },
    {
      "chapter": "Financial Management",
      "index": []
    },
    {
      "chapter": "Marketing",
      "index": []
    },
    {
      "chapter": "Consumer Protection",
      "index": []
    }
  ]
        },
        // Graphic Design 
        {
  "subject": "Graphic Design",
  "chapters": [
    {
      "chapter": "Role of Design in Society",
      "index": []
    },
    {
      "chapter": "Graphic Design Processes",
      "index": []
    },
    {
      "chapter": "Sketching and Drawing",
      "index": []
    },
    {
      "chapter": "Colour",
      "index": []
    },
    {
      "chapter": "Fundamentals of Visual Composition",
      "index": []
    },
    {
      "chapter": "Typography",
      "index": []
    },
    {
      "chapter": "Principles of Layout Design",
      "index": []
    },
    {
      "chapter": "Digital Imaging and Printing",
      "index": []
    },
    {
      "chapter": "Advertising Design",
      "index": []
    },
    {
      "chapter": "Campaign Design",
      "index": []
    },
    {
      "chapter": "Integrated Methods of Advertising",
      "index": []
    },
    {
      "chapter": "Graphic Design for Interactive Media",
      "index": []
    }
  ]
        },
        // Computer Science
        {
  "subject": "Computer Science",
  "chapters": [
    {
      "chapter": "Exception Handling in Python",
      "index": [
        "Introduction",
        "Syntax Errors",
        "Exceptions",
        "Built-in Exceptions",
        "Raising Exceptions",
        "Handling Exceptions",
        "Finally Clause"
      ]
    },
    {
      "chapter": "File Handling in Python",
      "index": [
        "Introduction to Files",
        "Types of Files",
        "Opening and Closing a Text File",
        "Writing to a Text File",
        "Reading from a Text File",
        "Setting Offsets in a File",
        "Creating and Traversing a Text File",
        "The Pickle Module"
      ]
    },
    {
      "chapter": "Stack",
      "index": [
        "Introduction",
        "Stack",
        "Operations on Stack",
        "Implementation of Stack in Python",
        "Notations for Arithmetic Expressions",
        "Conversion from Infix to Postfix Notation",
        "Evaluation of Postfix Expression"
      ]
    },
    {
      "chapter": "Queue",
      "index": [
        "Introduction to Queue",
        "Operations on Queue",
        "Implementation of Queue using Python",
        "Introduction to Deque",
        "Implementation of Deque Using Python"
      ]
    },
    {
      "chapter": "Sorting",
      "index": [
        "Introduction",
        "Bubble Sort",
        "Selection Sort",
        "Insertion Sort",
        "Time Complexity of Algorithms"
      ]
    },
    {
      "chapter": "Searching",
      "index": [
        "Introduction",
        "Linear Search",
        "Binary Search",
        "Search by Hashing"
      ]
    },
    {
      "chapter": "Understanding Data",
      "index": [
        "Introduction to Data",
        "Data Collection",
        "Data Storage",
        "Data Processing",
        "Statistical Techniques for Data Processing"
      ]
    },
    {
      "chapter": "Database Concepts",
      "index": [
        "Introduction",
        "File System",
        "Database Management System",
        "Relational Data Model",
        "Keys in a Relational Database"
      ]
    },
    {
      "chapter": "Structured Query Language (SQL)",
      "index": [
        "Introduction",
        "Structured Query Language (SQL)",
        "Data Types and Constraints in MySQL",
        "SQL for Data Definition",
        "SQL for Data Manipulation",
        "SQL for Data Query",
        "Data Updation and Deletion",
        "Functions in SQL",
        "GROUP BY Clause in SQL",
        "Operations on Relations",
        "Using Two Relations in a Query"
      ]
    },
    {
      "chapter": "Computer Networks",
      "index": [
        "Introduction to Computer Networks",
        "Evolution of Networking",
        "Types of Networks",
        "Network Devices",
        "Networking Topologies",
        "Identifying Nodes in a Networked Communication",
        "Internet, Web and the Internet of Things",
        "Domain Name System"
      ]
    },
    {
      "chapter": "Data Communication",
      "index": [
        "Concept of Communication",
        "Components of data Communication",
        "Measuring Capacity of Communication Media",
        "Types of Data Communication",
        "Switching Techniques",
        "Transmission Media",
        "Mobile Telecommunication Technologies",
        "Protocol"
      ]
    },
    {
      "chapter": "Security Aspects",
      "index": [
        "Threats and Prevention",
        "Malware",
        "Antivirus",
        "Spam",
        "HTTP vs HTTPS",
        "Firewall",
        "Cookies",
        "Hackers and Crackers",
        "Network Security Threats"
      ]
    },
    {
      "chapter": "Project Based Learning",
      "index": [
        "Introduction",
        "Approaches for Solving Projects",
        "Teamwork",
        "Project Descriptions"
      ]
    }
  ]
        },
        // Information Practices
        {
  "subject": "Informatics Practices",
  "chapters": [
    {
      "chapter": "Querying and SQL Functions",
      "index": [
        "Introduction",
        "Functions in SQL",
        "GROUP BY in SQL",
        "Operations on Relations",
        "Using Two Relations in a Query"
      ]
    },
    {
      "chapter": "Data Handling using Pandas - I",
      "index": [
        "Introduction to Python Libraries",
        "Series",
        "DataFrame",
        "Importing and Exporting Data between CSV Files and DataFrames",
        "Pandas Series Vs NumPy ndarray"
      ]
    },
    {
      "chapter": "Data Handling using Pandas - II",
      "index": [
        "Introduction",
        "Descriptive Statistics",
        "Data Aggregations",
        "Sorting a DataFrame",
        "GROUP BY Functions",
        "Altering the Index",
        "Other DataFrame Operations",
        "Handling Missing Values",
        "Import and Export of Data between Pandas and MySQL"
      ]
    },
    {
      "chapter": "Plotting Data using Matplotlib",
      "index": [
        "Introduction",
        "Plotting using Matplotlib",
        "Customisation of Plots",
        "The Pandas Plot Function (Pandas Visualisation)"
      ]
    },
    {
      "chapter": "Internet and Web",
      "index": [
        "Introduction to Computer Networks",
        "Types of Networks",
        "Network Devices",
        "Networking Topologies",
        "The Internet",
        "Applications of Internet",
        "Website",
        "Web Page",
        "Web Server",
        "Hosting of a Website",
        "Browser"
      ]
    },
    {
      "chapter": "Societal Impacts",
      "index": [
        "Introduction",
        "Digital Footprints",
        "Digital Society and Netizen",
        "Data Protection",
        "Creative Commons",
        "Cyber Crime",
        "Indian Information Technology Act (IT Act)",
        "E-waste: Hazards and Management",
        "Impact on Health"
      ]
    },
    {
      "chapter": "Project Based Learning",
      "index": [
        "Introduction",
        "Approaches for Solving Projects",
        "Teamwork",
        "Project Descriptions"
      ]
    }
  ]
        },
        // Applied Mathematics
        {
  "subject": "Applied Mathematics",
  "chapters": [
    {
      "chapter": "Numbers, Quantification and Numerical Applications",
      "index": []
    },
    {
      "chapter": "Algebra",
      "index": []
    },
    {
      "chapter": "Differentiation and its Applications",
      "index": []
    },
    {
      "chapter": "Integration and its Applications",
      "index": []
    },
    {
      "chapter": "Differential Equations and Modeling",
      "index": []
    },
    {
      "chapter": "Probability Distributions",
      "index": []
    },
    {
      "chapter": "Inferential Statistics",
      "index": []
    },
    {
      "chapter": "Index Numbers and Time Based Data",
      "index": []
    },
    {
      "chapter": "Financial Mathematics",
      "index": []
    },
    {
      "chapter": "Linear Programming Problem",
      "index": []
    },
    {
      "chapter": "Practical and Project Work",
      "index": []
    }
  ]
        },
        // Biotechnology
        {
"subject": "Biotechnology",
"chapters": [
{
"chapter": "An Overview of Recombinant DNA Technology",
"index": [
"An Overview of Recombinant DNA Technology"
]
},
{
"chapter": "Host–Vector System",
"index": [
"Two Key Components of Recombinant DNA Technology",
"Host",
"Vector",
"Eukaryotic Host Vector System",
"Expression Vectors",
"Shuttle vectors"
]
},
{
"chapter": "Gene Cloning",
"index": [
"Identification of Candidate Gene",
"Isolation of Nucleic Acids",
"Enzymes used for Recombinant DNA Technology",
"Modes of DNA Transfer",
"Screening and Selection",
"Blotting Techniques",
"Polymerase Chain Reaction (PCR)",
"DNA Libraries"
]
},
{
"chapter": "Applications of Recombinant DNA Technology",
"index": [
"DNA Fingerprinting",
"Transgenic Organism",
"Gene Therapy",
"Recombinant Vaccines",
"Therapeutic Agents/Molecules: Monoclonal Antibodies, Insulin and Growth Hormone"
]
},
{
"chapter": "Genome Technology and Engineering",
"index": [
"Mapping of the Genome: Genetic and Physical",
"High–Throughput DNA Sequencing",
"Other Genome-related Technology",
"Genome Engineering",
"Structural, Functional and Comparative Genomics",
"Protein Engineering"
]
},
{
"chapter": "Microbial Culture",
"index": [
"Historical Perspective",
"Nutritional Requirements and Culture Media",
"Sterilisation Methods",
"Pure Culture Techniques",
"Factors Affecting Microbial Growth",
"The Growth Curve"
]
},
{
"chapter": "Plant Tissue Culture",
"index": [
"Historical Perspective",
"Plant Cell and Tissue Culture Techniques",
"Nutrient Media",
"Culture Types",
"Applications of Plant Cell and Tissue Culture"
]
},
{
"chapter": "Animal Cell Culture",
"index": [
"Historical Perspective",
"Culture Media",
"Physical Environment for Culturing Animal Cells",
"Equipment Used for Cell Culture",
"Types of Animal Cell Cultures and Cell Lines",
"Cell Viability Determination",
"Advantages of Animal Cell Culture",
"Applications of Animal Cell Culture"
]
},
{
"chapter": "Stem Cell Culture and Organ Culture",
"index": [
"Stem Cell Culture",
"Organ Culture"
]
},
{
"chapter": "Bioprocessing and Biomanufacturing",
"index": [
"Historical Perspective",
"Instrumentation in Bioprocessing: Bioreactor and Fermenter Design",
"Operational Stages of Bioprocess",
"Bioprocessing and Biomanufacturing of Desired Products"
]
},
{
"chapter": "Bioremediation",
"index": [
"Waste Water Treatment",
"Solid Waste Management",
"Management and Disposal of Bio-medical Waste",
"Bioremediation of Pesticides"
]
},
{
"chapter": "Recent Innovations in Biotechnology",
"index": [
"Environmental Biotechnology",
"Plant Biotechnology",
"Regenerative Medicine",
"Nanobiotechnology",
"Synthetic Biology",
"Future Prospects"
]
},
{
"chapter": "Entrepreneurship",
"index": [
"Concept of Entrepreneurship",
"Sources of Funds",
"Entrepreneurship in Biotechnology",
"Concept of IPR",
"Biopiracy"
]
}
]
        },
        // Home Science
        {
  "subject": "Human Ecology and Family Sciences",
  "chapters": [
    {
      "chapter": "Work, Livelihood and Career",
      "index": []
    },
    {
      "chapter": "Clinical Nutrition and Dietetics",
      "index": []
    },
    {
      "chapter": "Public Nutrition and Health",
      "index": []
    },
    {
      "chapter": "Food Processing and Technology",
      "index": []
    },
    {
      "chapter": "Food Quality and Food Safety",
      "index": []
    },
    {
      "chapter": "Early Childhood Care and Education",
      "index": []
    },
    {
      "chapter": "Management of Support Services, Institutions and Programmes for Children, Youth and Elderly",
      "index": []
    },
    {
      "chapter": "Design for Fabric and Apparel",
      "index": []
    },
    {
      "chapter": "Fashion Design and Merchandising",
      "index": []
    },
    {
      "chapter": "Care and Maintenance of Fabrics in Institutions",
      "index": []
    },
    {
      "chapter": "Hospitality Management",
      "index": []
    },
    {
      "chapter": "Consumer Education and Protection",
      "index": []
    },
    {
      "chapter": "Development Communication and Journalism",
      "index": []
    },
    {
      "chapter": "Corporate Communication and Public Relations",
      "index": []
    }
  ]
        },
        // Crafts 1
        {
"subject": "Heritage Crafts: Craft Tradition of India",
"chapters": [
{
"chapter": "Crafts in the Past",
"index": []
},
{
"chapter": "Colonial Rule and Crafts",
"index": []
},
{
"chapter": "Mahatma Gandhi and Self-sufficiency",
"index": []
},
{
"chapter": "Handloom and Handicrafts Revival",
"index": []
},
{
"chapter": "The Crafts Community Today",
"index": []
},
{
"chapter": "Production and Marketing",
"index": []
},
{
"chapter": "Crafts Bazaars",
"index": []
},
{
"chapter": "Craft in the Age of Tourism",
"index": []
},
{
"chapter": "Design and Development",
"index": []
}
]
        },
        // Crafts 2
        {
"subject": "Heritage Crafts: Exploring the craft traditions of india",
"chapters": [
{
"chapter": "Crafts at Home",
"index": []
},
{
"chapter": "Local Heritage",
"index": []
},
{
"chapter": "Local Architecture",
"index": []
},
{
"chapter": "Local Market",
"index": []
},
{
"chapter": "Documentation Formats",
"index": []
},
{
"chapter": "Research and Preparation",
"index": []
},
{
"chapter": "Field Work",
"index": []
},
{
"chapter": "Presentation of Data",
"index": []
},
{
"chapter": "Innovations in Design and Processes",
"index": []
},
{
"chapter": "Creating an Aesthetic Environment",
"index": []
}
]
        },
        // Fine arts
        {
"subject": "Fine Arts",
"chapters": [
{
"chapter": "The Manuscript Painting Tradition",
"index": []
},
{
"chapter": "The Rajasthani Schools of Painting",
"index": []
},
{
"chapter": "The Mughal School of Miniature Painting",
"index": []
},
{
"chapter": "The Deccani Schools of Painting",
"index": []
},
{
"chapter": "The Pahari Schools of Painting",
"index": []
},
{
"chapter": "The Bengal School and Cultural Nationalism",
"index": []
},
{
"chapter": "The Modern Indian Art",
"index": []
},
{
"chapter": "The Living Art Traditions of India",
"index": []
}
]
        },
        // Physical Education CBSE
        {
"subject": "Physical Education CBSE",
"chapters": [
{
"chapter": "Planning in Sports",
"index": [
"Meaning & Objectives of Planning",
"Various Committees and their Responsibilities (pre; during & post Tournament)",
"Tournament - Knock-Out, League Or Round Robin & Combination",
"Procedure to Draw Fixtures - Knock-Out (Bye & Seeding) & League (Staircase & Cyclic)",
"Intramural and Extramural - Meaning, Objectives & Significance",
"Specific Sports Programme (Sports Day, Health Run, Run for Fun, Run For Specific Cause & Run For Unity)"
]
},
{
"chapter": "Sports & Nutrition",
"index": [
"Balanced Diet & Nutrition: Macro & Micro Nutrients",
"Nutritive & Non-Nutritive Components Of Diet",
"Eating For Weight Control - A Healthy Weight, The Pitfalls of Dieting, Food Intolerance & Food Myths"
]
},
{
"chapter": "Yoga & Lifestyle",
"index": [
"Asanas as Preventive Measures",
"Obesity: Procedure, Benefits & Contraindications for Vajrasana, Hastasana, Trikonasana, Ardh Matsyendrasana",
"Diabetes: Procedure, Benefits & Contraindications for Bhujangasana, Paschimottasana, Pavan Muktasana, Ardh Matsyendrasana",
"Asthma: Procedure, Benefits & Contraindications for Sukhasana, Chakrasana, Gomukhasana, Parvatasana, Bhujangasana, Paschimottasana, Matsyasana",
"Hypertension: Procedure, Benefits & Contraindications Tadasana, Vajrasana, Pavan Muktasana, Ardha Chakrasana, Bhujangasana, Sharasana",
"Back Pain: Procedure, Benefits & Contraindications Tadasana, Ardh Matsyendrasana, Vakrasana, Shalabhasana, Bhujangasana"
]
},
{
"chapter": "Physical Education & Sports for CMSN (Children With Special Needs - Divyang)",
"index": [
"Concept of Disability & Disorder",
"Types of Disability, Its Cognitive Disability, Intellectual Disability, Physical Disability",
"Types of Disorder, Its Cause & Nature (ADHD, SPD, ASD, ODD, OCD)",
"Disability Etiquettes",
"Advantage of Physical Activities for CMSN (Children with Special Needs)",
"Strategies to make Physical Activities Assessable for CMSN"
]
},
{
"chapter": "Children & Women in Sports",
"index": [
"Motor Development & Factors Affecting it",
"Exercise Guidelines at Different Stages of Growth & Development",
"Common Postural Deformities - Knock Knees; Flat Foot; Round Shoulders; Lordosis, Kyphosis, Bow Legs & Scoliosis & Their Corrective Measures",
"Sports Participation of Women in India",
"Special consideration (Menarch & Menstrual Dysfunction)",
"Female Athletes Triad (Oestoperosis, Amenorrhea, Eating Disorders)"
]
},
{
"chapter": "Test & Measurement in Sports",
"index": [
"Motor Fitness Test - 50 M Standing Start, 600 M Run/Walk, Sit & Reach, Partial Curl Up, Push Ups (Boys), Modified Push Ups (Girls), Standing Broad Jump, Agility - 4x10 M Shuttle Run",
"General Motor Fitness - Barrow Three Item General Motor Ability (Standing Broad Jump, Zig Zag Run, Medicine Ball Put - For Boys: 03 Kg & For Girls: 01 Kg)",
"Measurement of Cardio Vascular Fitness - Harvard Step Test/Rockport Test - Computation of Fitness Index",
"Rikli & Jones - Senior Citizen Fitness Test: Chair Stand Test for lower body strength, Arm Curl Test for Upper Body Strength, Chair Sit & Reach Test for Lower Body Flexibility, Back Scratch Test for Upper Body Flexibility, Eight Foot Up & Go Test for Agility, Six Minute Walk Test for Aerobic Endurance"
]
},
{
"chapter": "Physiology & Injuries in Sports",
"index": [
"Physiological Factors Determining Components of Physical Fitness",
"Effect of Exercise on Cardio Respiratory System",
"Effect of Exercise on Muscular System",
"Physiological changes due to ageing",
"Sports Injuries: Classification (Soft Tissue Injuries: Abrasion, Contusion, Laceration, Incision, Sprain & Strain; Bone & Joint Injuries: Dislocation, Fractures: Stress Fracture, Green Stick, Communated, Transverse Oblique & Impacted) Causes, Prevention & treatment",
"First Aid - Aims & Objectives"
]
},
{
"chapter": "Biomechanics & Sports",
"index": [
"Meaning and Importance of Biomechanics in Sports",
"Types of Movements (Flexion, Extension, Abduction & Adduction)",
"Newton's Laws of Motion & Their Application in Sports",
"Friction & Sports"
]
},
{
"chapter": "Psychology & Sports",
"index": [
"Personality; Its Definition & Types - Trait & Types (Sheldon & Jung Classification) & Big Five Theory",
"Motivation, Its Type & Techniques",
"Exercise Adherence; Reasons to Exercise, Benefits of Exercise",
"Strategies for Enhancing Adherence to Exercise",
"Meaning, Concept & Types of Aggressions in Sports"
]
},
{
"chapter": "Training in Sports",
"index": [
"Strength - Definition, Types & Methods of Improving Strength - Isometric, Isotonic & Isokinetic",
"Endurance - Definition, Types & Methods to Develop Endurance - Continuous Training, Interval Training & Fartlek Training",
"Speed - Definition, Types & Methods to Develop Speed - Acceleration Run & Pace Run",
"Flexibility - Definition, Types & Methods to Improve flexibility",
"Coordinative Abilities - Definition & Types",
"Circuit Training - Introduction & Its Importance"
]
}
]
        },
        // Physical Education CBSE revised 2022
        {
  "subject": "Physical Education CBSE revised 2022",
  "chapters": [
    {
      "chapter": "Management of Sporting Events",
      "index": []
    },
    {
      "chapter": "Children and Women in Sports",
      "index": []
    },
    {
      "chapter": "Yoga as Preventive Measure for Lifestyle Disease",
      "index": []
    },
    {
      "chapter": "Physical Education and Sport for Children with Special Needs",
      "index": []
    },
    {
      "chapter": "Sports and Nutrition",
      "index": []
    },
    {
      "chapter": "Test and Measurement in Sports",
      "index": []
    },
    {
      "chapter": "Physiology and Injuries in Sports",
      "index": []
    },
    {
      "chapter": "Biomechanics & Sports",
      "index": []
    },
    {
      "chapter": "Psychology and Sports",
      "index": []
    },
    {
      "chapter": "Training in Sports",
      "index": []
    }
  ]
        }
      ]
    },
    {
      "class":"10th",
      "subjects":[
        // Mathematics 
        {
  "subject": "Mathematics",
  "chapters": [
    {
      "chapter": "Real Numbers",
      "index": [
        "Introduction",
        "The Fundamental Theorem of Arithmetic",
        "Revisiting Irrational Numbers",
        "Summary"
      ]
    },
    {
      "chapter": "Polynomials",
      "index": [
        "Introduction",
        "Geometrical Meaning of the Zeroes of a Polynomial",
        "Relationship between Zeroes and Coefficients of a Polynomial",
        "Summary"
      ]
    },
    {
      "chapter": "Pair of Linear Equations in Two Variables",
      "index": [
        "Introduction",
        "Graphical Method of Solution of a Pair of Linear Equations",
        "Algebraic Methods of Solving a Pair of Linear Equations",
        "Substitution Method",
        "Elimination Method",
        "Summary"
      ]
    },
    {
      "chapter": "Quadratic Equations",
      "index": [
        "Introduction",
        "Quadratic Equations",
        "Solution of a Quadratic Equation by Factorisation",
        "Nature of Roots",
        "Summary"
      ]
    },
    {
      "chapter": "Arithmetic Progressions",
      "index": [
        "Introduction",
        "Arithmetic Progressions",
        "nth Term of an AP",
        "Sum of First n Terms of an AP",
        "Summary"
      ]
    },
    {
      "chapter": "Triangles",
      "index": [
        "Introduction",
        "Similar Figures",
        "Similarity of Triangles",
        "Criteria for Similarity of Triangles",
        "Summary"
      ]
    },
    {
      "chapter": "Coordinate Geometry",
      "index": [
        "Introduction",
        "Distance Formula",
        "Section Formula",
        "Summary"
      ]
    },
    {
      "chapter": "Introduction to Trigonometry",
      "index": [
        "Introduction",
        "Trigonometric Ratios",
        "Trigonometric Ratios of Some Specific Angles",
        "Trigonometric Identities",
        "Summary"
      ]
    },
    {
      "chapter": "Some Applications of Trigonometry",
      "index": [
        "Introduction",
        "Heights and Distances",
        "Summary"
      ]
    },
    {
      "chapter": "Circles",
      "index": [
        "Introduction",
        "Tangent to a Circle",
        "Number of Tangents from a Point on a Circle",
        "Summary"
      ]
    },
    {
      "chapter": "Areas Related to Circles",
      "index": [
        "Introduction",
        "Areas of Sector and Segment of a Circle",
        "Summary"
      ]
    },
    {
      "chapter": "Surface Areas and Volumes",
      "index": [
        "Introduction",
        "Surface Area of a Combination of Solids",
        "Volume of a Combination of Solids",
        "Summary"
      ]
    },
    {
      "chapter": "Statistics",
      "index": [
        "Introduction",
        "Mean of Grouped Data",
        "Mode of Grouped Data",
        "Median of Grouped Data",
        "Summary"
      ]
    },
    {
      "chapter": "Probability",
      "index": [
        "Introduction",
        "Probability — A Theoretical Approach",
        "Summary"
      ]
    }
  ]
        },
        // Science
        {
  "subject": "Science",
  "chapters": [
    {
      "chapter": "Chemical Reactions and Equations",
      "index": []
    },
    {
      "chapter": "Acids, Bases and Salts",
      "index": []
    },
    {
      "chapter": "Metals and Non-metals",
      "index": []
    },
    {
      "chapter": "Carbon and its Compounds",
      "index": []
    },
    {
      "chapter": "Life Processes",
      "index": []
    },
    {
      "chapter": "Control and Coordination",
      "index": []
    },
    {
      "chapter": "How do Organisms Reproduce?",
      "index": []
    },
    {
      "chapter": "Heredity",
      "index": []
    },
    {
      "chapter": "Light – Reflection and Refraction",
      "index": []
    },
    {
      "chapter": "The Human Eye and the Colourful World",
      "index": []
    },
    {
      "chapter": "Electricity",
      "index": []
    },
    {
      "chapter": "Magnetic Effects of Electric Current",
      "index": []
    },
    {
      "chapter": "Our Environment",
      "index": []
    }
  ]
        },
        // Social Science: Contemporary India
        {
  "subject": "Social Science: Contemporary India",
  "chapters": [
    {
      "chapter": "Resources and Development",
      "index": []
    },
    {
      "chapter": "Forest and Wildlife Resources",
      "index": []
    },
    {
      "chapter": "Water Resources",
      "index": []
    },
    {
      "chapter": "Agriculture",
      "index": []
    },
    {
      "chapter": "Minerals and Energy Resources",
      "index": []
    },
    {
      "chapter": "Manufacturing Industries",
      "index": []
    },
    {
      "chapter": "Lifelines of National Economy",
      "index": []
    }
  ]
        },
        // Social Science: India and the Contemporary World-II
        {
  "subject": "Social Science: India and the Contemporary World-II",
  "chapters": [
    {
      "chapter": "The Rise of Nationalism in Europe",
      "index": []
    },
    {
      "chapter": "Nationalism in India",
      "index": []
    },
    {
      "chapter": "The Making of a Global World",
      "index": []
    },
    {
      "chapter": "The Age of Industrialisation",
      "index": []
    },
    {
      "chapter": "Print Culture and the Modern World",
      "index": []
    }
  ]
        },
        // Social Science: Understanding Economic Development
        {
  "subject": "Social Science: Understanding Economic Development",
  "chapters": [
    {
      "chapter": "Development",
      "index": []
    },
    {
      "chapter": "Sectors of the Indian Economy",
      "index": []
    },
    {
      "chapter": "Money and Credit",
      "index": []
    },
    {
      "chapter": "Globalisation and the Indian Economy",
      "index": []
    },
    {
      "chapter": "Consumer Rights",
      "index": []
    }
  ]
        },
        // Social Science: Democratic Politics
        {
  "subject": "Social Science: Democratic Politics",
  "chapters": [
    {
      "chapter": "Power-sharing",
      "index": []
    },
    {
      "chapter": "Federalism",
      "index": []
    },
    {
      "chapter": "Gender, Religion and Caste",
      "index": []
    },
    {
      "chapter": "Political Parties",
      "index": []
    },
    {
      "chapter": "Outcomes of Democracy",
      "index": []
    }
  ]
        },
        // English: First Flight
        {
  "subject": "English: First Flight",
  "chapters": [
    {
      "chapter": "A Letter to God",
      "index": []
    },
    {
      "chapter": "Nelson Mandela: Long Walk to Freedom",
      "index": []
    },
    {
      "chapter": "Two Stories about Flying",
      "index": []
    },
    {
      "chapter": "From the Diary of Anne Frank",
      "index": []
    },
    {
      "chapter": "Glimpses of India",
      "index": []
    },
    {
      "chapter": "Mijbil the Otter",
      "index": []
    },
    {
      "chapter": "Madam Rides the Bus",
      "index": []
    },
    {
      "chapter": "The Sermon at Benares",
      "index": []
    },
    {
      "chapter": "The Proposal",
      "index": []
    }
  ]
        },
        // English: Footprints without Feet
        {
  "subject": "English: Footprints without Feet",
  "chapters": [
    {
      "chapter": "A Triumph of Surgery",
      "index": []
    },
    {
      "chapter": "The Thief's Story",
      "index": []
    },
    {
      "chapter": "The Midnight Visitor",
      "index": []
    },
    {
      "chapter": "A Question of Trust",
      "index": []
    },
    {
      "chapter": "Footprints without Feet",
      "index": []
    },
    {
      "chapter": "The Making of a Scientist",
      "index": []
    },
    {
      "chapter": "The Necklace",
      "index": []
    },
    {
      "chapter": "Bholi",
      "index": []
    },
    {
      "chapter": "The Book That Saved the Earth",
      "index": []
    }
  ]
        },
        // English: Words and Expressions 2
        {
  "subject": "English: Words and Expressions 2",
  "chapters": [
    {
      "chapter": "A Letter to God",
      "index": []
    },
    {
      "chapter": "Nelson Mandela: Long Walk to Freedom",
      "index": []
    },
    {
      "chapter": "Two Stories about Flying",
      "index": []
    },
    {
      "chapter": "From the Diary of Anne Frank",
      "index": []
    },
    {
      "chapter": "Glimpses of India",
      "index": []
    },
    {
      "chapter": "Mijbil the Otter",
      "index": []
    },
    {
      "chapter": "Madam Rides the Bus",
      "index": []
    },
    {
      "chapter": "The Sermon at Benares",
      "index": []
    },
    {
      "chapter": "The Proposal",
      "index": []
    }
  ]
        },
        // English: Literature Reader
        {
  "subject": "English: Literature Reader",
  "chapters": [
    {
      "chapter": "Two Gentlemen of Verona",
      "index": []
    },
    {
      "chapter": "Mrs. Packletide's Tiger",
      "index": []
    },
    {
      "chapter": "The Letter",
      "index": []
    },
    {
      "chapter": "A Shady Plot",
      "index": []
    },
    {
      "chapter": "Patol Babu, Film Star",
      "index": []
    },
    {
      "chapter": "Virtually True",
      "index": []
    },
    {
      "chapter": "The Frog and the Nightingale",
      "index": []
    },
    {
      "chapter": "Not Marble, nor the Gilded Monuments",
      "index": []
    },
    {
      "chapter": "Ozymandias",
      "index": []
    },
    {
      "chapter": "The Rime of the Ancient Mariner",
      "index": []
    },
    {
      "chapter": "Snake",
      "index": []
    },
    {
      "chapter": "The Dear Departed",
      "index": []
    },
    {
      "chapter": "Julius Caesar",
      "index": []
    }
  ]
        },
        // English: Main Course Book
        {
  "subject": "English: Main Course Book CBSE",
  "chapters": [
    {
      "chapter": "Do Indians Get Enough Sleep?",
      "index": []
    },
    {
      "chapter": "Laughter-The Best Medicine",
      "index": []
    },
    {
      "chapter": "Whopping Walter Hudson",
      "index": []
    },
    {
      "chapter": "The World of Sports",
      "index": []
    },
    {
      "chapter": "Nature's Medicines",
      "index": []
    },
    {
      "chapter": "My Struggle For An Education",
      "index": []
    },
    {
      "chapter": "Educating The Girl Child",
      "index": []
    },
    {
      "chapter": "Inclusive Education",
      "index": []
    },
    {
      "chapter": "Vocational Education",
      "index": []
    },
    {
      "chapter": "Promise For The Future: Renewable Energy",
      "index": []
    },
    {
      "chapter": "Plugging Into Future",
      "index": []
    },
    {
      "chapter": "Space Travel",
      "index": []
    },
    {
      "chapter": "Letters From The Planet Aurigae II",
      "index": []
    },
    {
      "chapter": "Treading the Green Path- Towards Preservation",
      "index": []
    },
    {
      "chapter": "Heroes of the Environment",
      "index": []
    },
    {
      "chapter": "Let's Clean Up",
      "index": []
    },
    {
      "chapter": "A Tale of Three Villages",
      "index": []
    },
    {
      "chapter": "Geological Heritage",
      "index": []
    },
    {
      "chapter": "Land of All Seasons",
      "index": []
    },
    {
      "chapter": "Eco Tourism",
      "index": []
    },
    {
      "chapter": "The Emerald Islands",
      "index": []
    },
    {
      "chapter": "Promoting Tourism",
      "index": []
    },
    {
      "chapter": "Unity in Diversity",
      "index": []
    },
    {
      "chapter": "Challenges to National Integration",
      "index": []
    },
    {
      "chapter": "Spirit of Unity",
      "index": []
    },
    {
      "chapter": "Mile Sur Mera Tumhara",
      "index": []
    }
  ]
        },
        // English: Workbook 
        {
  "subject": "English: Workbook CBSE",
  "chapters": [
    {
      "chapter": "Determiners",
      "index": []
    },
    {
      "chapter": "Tenses",
      "index": []
    },
    {
      "chapter": "Subject-Verb Agreement",
      "index": []
    },
    {
      "chapter": "Non-Finites - Infinitives and Participles",
      "index": []
    },
    {
      "chapter": "Relatives",
      "index": []
    },
    {
      "chapter": "Connectors",
      "index": []
    },
    {
      "chapter": "Conditionals",
      "index": []
    },
    {
      "chapter": "Comparison",
      "index": []
    },
    {
      "chapter": "Avoiding Repetition- Substitution and Omission",
      "index": []
    },
    {
      "chapter": "Nominalisation",
      "index": []
    },
    {
      "chapter": "Modals - Expressing Attitudes",
      "index": []
    },
    {
      "chapter": "Active and Passive",
      "index": []
    },
    {
      "chapter": "Reported Speech",
      "index": []
    },
    {
      "chapter": "Prepositions",
      "index": []
    }
  ]
        },
        // Hindi: Kshitij 2
        {
  "subject": "Hindi: Kshitij Part 2",
  "chapters": [
    {
      "chapter": "सूरदास - पद",
      "index": []
    },
    {
      "chapter": "तुलसीदास - राम-लक्ष्मण-परशुराम संवाद",
      "index": []
    },
    {
      "chapter": "जयशंकर प्रसाद - आत्मकथ्य",
      "index": []
    },
    {
      "chapter": "सूर्यकांत त्रिपाठी 'निराला' - उत्साह / अट नहीं रही है",
      "index": []
    },
    {
      "chapter": "नागार्जुन - यह दंतुरित मुस्कान / फसल",
      "index": []
    },
    {
      "chapter": "मंगलेश डबराल - संगतकार",
      "index": []
    },
    {
      "chapter": "स्वयं प्रकाश - नेताजी का चश्मा",
      "index": []
    },
    {
      "chapter": "रामवृक्ष बेनीपुरी - बालगोबिन भगत",
      "index": []
    },
    {
      "chapter": "यशपाल - लखनवी अंदाज",
      "index": []
    },
    {
      "chapter": "मन्नू भंडारी - एक कहानी यह भी",
      "index": []
    },
    {
      "chapter": "यतीन्द्र मिश्र - नौबतखाने में इबादत",
      "index": []
    },
    {
      "chapter": "भदंत आनंद कौसल्यायन - संस्कृति",
      "index": []
    }
  ]
        },
        // Hindi Sparsh Part 2
        {
  "subject": "Hindi: Sparsh Part 2",
  "chapters": [
    {
      "chapter": "कबीर - साखी",
      "index": []
    },
    {
      "chapter": "मीरा - पद",
      "index": []
    },
    {
      "chapter": "मैथिलीशरण गुप्त - मनुष्यता",
      "index": []
    },
    {
      "chapter": "सुमित्रानंदन पंत - पर्वत प्रदेश में पावस",
      "index": []
    },
    {
      "chapter": "वीरेन डंगवाल - तोप",
      "index": []
    },
    {
      "chapter": "कैफ़ी आज़मी - कर चले हम फ़िदा",
      "index": []
    },
    {
      "chapter": "रवींद्रनाथ ठाकुर - आत्मत्राण",
      "index": []
    },
    {
      "chapter": "प्रेमचंद - बड़े भाई साहब",
      "index": []
    },
    {
      "chapter": "सीताराम सेक्सरिया - डायरी का एक पन्ना",
      "index": []
    },
    {
      "chapter": "लीलाधर मंडलोई - तताँरा-वामीरो कथा",
      "index": []
    },
    {
      "chapter": "प्रहलाद अग्रवाल - तीसरी कसम के शिल्पकार शैलेंद्र",
      "index": []
    },
    {
      "chapter": "निदा फ़ाज़ली - अब कहाँ दूसरे के दुख से दुखी होने वाले",
      "index": []
    },
    {
      "chapter": "रवींद्र केलेकर - पतझर में टूटी पत्तियाँ: (I) गिन्नी का सोना / (II) झेन की देन",
      "index": []
    },
    {
      "chapter": "हबीब तनवीर - कारतूस (एकांकी)",
      "index": []
    }
  ]
        },
        // Hindi Kritika Part 2
        {
  "subject": "Hindi: Kritika Part 2",
  "chapters": [
    {
      "chapter": "शिवपूजन सहाय - माता का अँचल",
      "index": []
    },
    {
      "chapter": "मधु कांकरिया - साना-साना हाथ जोड़ि...",
      "index": []
    },
    {
      "chapter": "अज्ञेय - मैं क्यों लिखता हूँ?",
      "index": []
    }
  ]
        },
        // Hindi Sanchayan Part 2
        {
  "subject": "Hindi: Sanchayan Part 2",
  "chapters": [
    {
      "chapter": "मिथिलेश्वर - हरिहर काका",
      "index": []
    },
    {
      "chapter": "गुरदयाल सिंह - सपनों के-से दिन",
      "index": []
    },
    {
      "chapter": "राही मासूम रज़ा - टोपी शुक्ला",
      "index": []
    }
  ]
        },
        // Sanskrit Shemushi
        {
  "subject": "Sanskrit Shemushi part 2",
  "chapters": [
    {
      "chapter": "शुचिपर्यावरणम्",
      "index": []
    },
    {
      "chapter": "बुद्धिर्बलवती सदा",
      "index": []
    },
    {
      "chapter": "शिशुलालनम्",
      "index": []
    },
    {
      "chapter": "जननी तुल्यवत्सला",
      "index": []
    },
    {
      "chapter": "सुभाषितानि",
      "index": []
    },
    {
      "chapter": "सौहार्दं प्रकृतेः शोभा",
      "index": []
    },
    {
      "chapter": "विचित्रः साक्षी",
      "index": []
    },
    {
      "chapter": "सूक्तयः",
      "index": []
    },
    {
      "chapter": "भूकम्पविभीषिका",
      "index": []
    },
    {
      "chapter": "अन्योक्तयः",
      "index": []
    }
  ]
        },
        // Sanskrit Abhyasvan Bhav
        {
  "subject": "Sanskrit: Abhyasvan Bhav",
  "chapters": [
    {
      "chapter": "अपठितावबोधनम्",
      "index": []
    },
    {
      "chapter": "पत्रलेखनम्",
      "index": []
    },
    {
      "chapter": "अनुच्छेदलेखनम्",
      "index": []
    },
    {
      "chapter": "चित्रवर्णनम्",
      "index": []
    },
    {
      "chapter": "रचनानुवादः (वाक्यरचनाकौशलम्)",
      "index": []
    },
    {
      "chapter": "सन्धिः",
      "index": []
    },
    {
      "chapter": "समासाः",
      "index": []
    },
    {
      "chapter": "प्रत्ययाः",
      "index": []
    },
    {
      "chapter": "अव्ययानि",
      "index": []
    },
    {
      "chapter": "समयः",
      "index": []
    },
    {
      "chapter": "वाच्यम्",
      "index": []
    },
    {
      "chapter": "अशुद्धिसंशोधनम्",
      "index": []
    },
    {
      "chapter": "मिश्रिताभ्यासः",
      "index": []
    },
    {
      "chapter": "आदर्शप्रश्नपत्रम्",
      "index": []
    }
  ]
        },
        // Sanskrit Vyakaranvithi
        {
  "subject": "Sanskrit: Vyakaranvithi",
  "chapters": [
    {
      "chapter": "वर्ण विचार",
      "index": []
    },
    {
      "chapter": "संज्ञा एवं परिभाषा प्रकरण",
      "index": []
    },
    {
      "chapter": "सन्धि",
      "index": []
    },
    {
      "chapter": "शब्दरूप सामान्य परिचय",
      "index": []
    },
    {
      "chapter": "धातुरूप सामान्य परिचय",
      "index": []
    },
    {
      "chapter": "उपसर्ग",
      "index": []
    },
    {
      "chapter": "अव्यय",
      "index": []
    },
    {
      "chapter": "प्रत्यय",
      "index": []
    },
    {
      "chapter": "समास परिचय",
      "index": []
    },
    {
      "chapter": "कारक और विभक्ति",
      "index": []
    },
    {
      "chapter": "वाच्य परिवर्तन",
      "index": []
    },
    {
      "chapter": "रचना प्रयोग",
      "index": []
    }
  ]
        },
        // Sanskrit Manika Part 2
        {
  "subject": "Sanskrit: Manika Part 2",
  "chapters": [
    {
      "chapter": "अथ स्वागतम्",
      "index": []
    },
    {
      "chapter": "समानमस्तु वो मनः",
      "index": []
    },
    {
      "chapter": "वाग्मयं तपः",
      "index": []
    },
    {
      "chapter": "नास्ति त्यागसमं सुखम्",
      "index": []
    },
    {
      "chapter": "रमणीया हि सृष्टिः एषा",
      "index": []
    },
    {
      "chapter": "आज्ञा गुरूणां हि अविचारणीया",
      "index": []
    },
    {
      "chapter": "अभ्यासवशगं मनः",
      "index": []
    },
    {
      "chapter": "राष्ट्रं संरक्षयेम् हि",
      "index": []
    },
    {
      "chapter": "साधुवृत्तिं समाचरेत्",
      "index": []
    },
    {
      "chapter": "तिरुक्कुरल्-सूक्ति-सौरभम्",
      "index": []
    },
    {
      "chapter": "सुस्वागतं भो! अरुणाचलेऽस्मिन्",
      "index": []
    },
    {
      "chapter": "कालोऽहम्",
      "index": []
    },
    {
      "chapter": "किं किम् उपादेयम्",
      "index": []
    }
  ]
        },
        // Sanskrit Manika Abhyas - Pustakam
        {
  "subject": "Sanskrit: Manika Abhyas Pustakam",
  "chapters": [
    {
      "chapter": "वर्णानाम् उच्चारणस्थानानि, स्वरसन्धयः, व्यञ्जनसन्धयः, विसर्गसन्धयः",
      "index": []
    },
    {
      "chapter": "सन्धयः",
      "index": [
        "(क) स्वरसन्धयः",
        "(ख) व्यञ्जनसन्धयः",
        "(ग) विसर्गसन्धिः"
      ]
    },
    {
      "chapter": "समासाः",
      "index": [
        "(क) अव्ययीभाव समासः",
        "(ख) तत्पुरुषाः",
        "(ग) द्वन्द्वसमासः",
        "(घ) बहुव्रीहिः"
      ]
    },
    {
      "chapter": "प्रत्ययाः",
      "index": [
        "(क) कृत्प्रत्ययाः",
        "(ख) तद्धितप्रत्ययाः",
        "(ग) स्त्रीप्रत्ययौ"
      ]
    },
    {
      "chapter": "वाच्यम्",
      "index": []
    },
    {
      "chapter": "सङ्ख्या",
      "index": []
    },
    {
      "chapter": "समयः",
      "index": []
    },
    {
      "chapter": "अव्ययानि",
      "index": []
    },
    {
      "chapter": "अशुद्धिसंशोधनम्",
      "index": []
    },
    {
      "chapter": "रचनात्मककार्यम्",
      "index": [
        "(क) चित्रवर्णनम्",
        "(ख) अनुच्छेदलेखनम्",
        "(ग) पत्रलेखनम्",
        "(घ) संवादलेखनम्",
        "(ङ) कथापूर्तिः"
      ]
    },
    {
      "chapter": "अपठितावबोधनम्",
      "index": []
    }
  ]
        },
        // Physical Education
        {
  "subject": "Health and Physical Education",
  "chapters": [
    {
      "chapter": "Physical Education: Relation with other Subjects",
      "index": []
    },
    {
      "chapter": "Effects of Physical Activities on Human Body",
      "index": []
    },
    {
      "chapter": "Growth and Development during Adolescence",
      "index": []
    },
    {
      "chapter": "Individual Games and Sports I",
      "index": []
    },
    {
      "chapter": "Individual Games and Sports II",
      "index": []
    },
    {
      "chapter": "Team Games and Sports I",
      "index": []
    },
    {
      "chapter": "Team Games and Sports II",
      "index": []
    },
    {
      "chapter": "Yoga for Healthy Living",
      "index": []
    },
    {
      "chapter": "Dietary Considerations and Food Quality",
      "index": []
    },
    {
      "chapter": "Safety Measures for Healthy Living",
      "index": []
    },
    {
      "chapter": "Healthy Community Living",
      "index": []
    },
    {
      "chapter": "Social Health",
      "index": []
    },
    {
      "chapter": "Agencies and Awards Promoting Health, Sports and Yoga",
      "index": []
    }
  ]
        }


      ]
    },
    
  ]
}
// Connect to MongoDB
mongoose.connect("mongodb+srv://ankitsinghchouhan:mu25LKrWppJpodlD@cluster0.nuxfuua.mongodb.net/lastminuteapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected for seeding...");
}).catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Seeder function
const seedClasses = async () => {
  try {
    // // Remove existing data (optional)
    // await ClassModel.deleteMany({});
    // console.log("Existing classes cleared.");

    // Insert new data
    await ClassModel.insertMany(classesData.classes, { ordered: false });
    console.log("Classes seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run the seeder
seedClasses();
