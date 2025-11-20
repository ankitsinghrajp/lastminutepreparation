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
"subject": "History: Themes in Indian History Part 1",
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
"subject": "History: Themes in Indian History Part 2",
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
"subject": "History: Themes in Indian History Part 3",
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
  "subject": "Sanskrit: Sahitya - Parichay",
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
  "subject": "Home Science: Human Ecology and Family Sciences",
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
"subject": "Physical Education: Physical Education CBSE",
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
  "subject": "Physical Education: Physical Education CBSE revised 2022",
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
  "subject": "Sanskrit: Shemushi part 2",
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
  "subject": "Physical Education: Health and Physical Education",
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
    {
      "class":"11th",
      "subjects":[
        // Accountacy
        {
  "subject": "Accountancy",
  "chapters": [
    {
      "chapter": "Introduction to Accounting",
      "index": [
        "Meaning of Accounting",
        "Accounting as a Source of Information",
        "Objectives of Accounting",
        "Role of Accounting",
        "Basic Terms in Accounting"
      ]
    },
    {
      "chapter": "Theory Base of Accounting",
      "index": [
        "Generally Accepted Accounting Principles",
        "Basic Accounting Concepts",
        "Systems of Accounting",
        "Basis of Accounting",
        "Accounting Standards"
      ]
    },
    {
      "chapter": "Recording of Transactions - I",
      "index": [
        "Business Transactions and Source Document",
        "Accounting Equation",
        "Using Debit and Credit",
        "Books of Original Entry",
        "The Ledger",
        "Posting from Journal"
      ]
    },
    {
      "chapter": "Recording of Transactions - II",
      "index": [
        "Cash Book",
        "Purchases (Journal) Book",
        "Purchases Return (Journal) Book",
        "Sales (Journal) Book",
        "Sales Return (Journal) Book",
        "Journal Proper",
        "Balancing the Accounts"
      ]
    },
    {
      "chapter": "Bank Reconciliation Statement",
      "index": [
        "Need for Reconciliation",
        "Preparation of Bank Reconciliation Statement"
      ]
    },
    {
      "chapter": "Trial Balance and Rectification of Errors",
      "index": [
        "Meaning of Trial Balance",
        "Objectives of Preparing the Trial Balance",
        "Preparation of Trial Balance",
        "Significance of Agreement of Trial Balance",
        "Searching of Errors",
        "Rectification of Errors"
      ]
    },
    {
      "chapter": "Depreciation, Provisions and Reserves",
      "index": [
        "Depreciation",
        "Depreciation and other Similar Terms",
        "Causes of Depreciation",
        "Need for Depreciation",
        "Factors Affecting the Amount of Depreciation",
        "Methods of Calculating Depreciation Amount",
        "Straight Line Method and Written Down Method: A Comparative Analysis",
        "Methods of Recording Depreciation",
        "Disposal of Asset",
        "Effect of any Addition or Extension to the Existing Asset",
        "Provisions",
        "Reserves",
        "Secret Reserve"
      ]
    },
    {
      "chapter": "Financial Statements - I",
      "index": [
        "Stakeholders and their Information Requirements",
        "Distinction between Capital and Revenue",
        "Financial Statements",
        "Trading and Profit and Loss Account",
        "Operating Profit (EBIT)",
        "Balance Sheet",
        "Opening Entry"
      ]
    },
    {
      "chapter": "Financial Statements - II",
      "index": [
        "Need for Adjustments",
        "Closing Stock",
        "Outstanding Expenses",
        "Prepaid Expenses",
        "Accrued Income",
        "Income Received in Advance",
        "Depreciation",
        "Bad Debts",
        "Provision for Bad and Doubtful Debts",
        "Provision for Discount on Debtors",
        "Manager’s Commission",
        "Interest on Capital"
      ]
    }
  ]
        },
        // Chemistry
        {
  "subject": "Chemistry",
  "chapters": [
    {
      "chapter": "Some Basic Concepts of Chemistry",
      "index": [
        "Importance of Chemistry",
        "Nature of Matter",
        "Properties of Matter and their Measurement",
        "Uncertainty in Measurement",
        "Laws of Chemical Combinations",
        "Dalton’s Atomic Theory",
        "Atomic and Molecular Masses",
        "Mole Concept and Molar Masses",
        "Percentage Composition",
        "Stoichiometry and Stoichiometric Calculations"
      ]
    },
    {
      "chapter": "Structure of Atom",
      "index": [
        "Discovery of Sub-atomic Particles",
        "Atomic Models",
        "Developments Leading to the Bohr’s Model of Atom",
        "Bohr’s Model for Hydrogen Atom",
        "Towards Quantum Mechanical Model of the Atom",
        "Quantum Mechanical Model of Atom"
      ]
    },
    {
      "chapter": "Classification of Elements and Periodicity in Properties",
      "index": [
        "Why do we Need to Classify Elements ?",
        "Genesis of Periodic Classification",
        "Modern Periodic Law and the Present Form of the Periodic Table",
        "Nomenclature of Elements with Atomic Numbers > 100",
        "Electronic Configurations of Elements and the Periodic Table",
        "Electronic Configurations and Types of Elements: s-, p-, d-, f- Blocks",
        "Periodic Trends in Properties of Elements"
      ]
    },
    {
      "chapter": "Chemical Bonding and Molecular Structure",
      "index": [
        "Kössel-Lewis Approach to Chemical Bonding",
        "Ionic or Electrovalent Bond",
        "Bond Parameters",
        "The Valence Shell Electron Pair Repulsion (VSEPR) Theory",
        "Valence Bond Theory",
        "Hybridisation",
        "Molecular Orbital Theory",
        "Bonding in Some Homonuclear Diatomic Molecules",
        "Hydrogen Bonding"
      ]
    },
    {
      "chapter": "Thermodynamics",
      "index": [
        "Thermodynamic Terms",
        "Applications",
        "Measurement of ΔU and ΔH: Calorimetry",
        "Enthalpy Change, Δ_rH of a Reaction – Reaction Enthalpy",
        "Enthalpies for Different Types of Reactions",
        "Spontaneity",
        "Gibbs Energy Change and Equilibrium"
      ]
    },
    {
      "chapter": "Equilibrium",
      "index": [
        "Equilibrium in Physical Processes",
        "Equilibrium in Chemical Processes – Dynamic Equilibrium",
        "Law of Chemical Equilibrium and Equilibrium Constant",
        "Homogeneous Equilibria",
        "Heterogeneous Equilibria",
        "Applications of Equilibrium Constants",
        "Relationship between Equilibrium Constant K, Reaction Quotient Q and Gibbs Energy G",
        "Factors Affecting Equilibria",
        "Ionic Equilibrium in Solution",
        "Acids, Bases and Salts",
        "Ionization of Acids and Bases",
        "Buffer Solutions",
        "Solubility Equilibria of Sparingly Soluble Salts"
      ]
    },
    {
      "chapter": "Redox Reactions",
      "index": [
        "Classical Idea of Redox Reactions-Oxidation and Reduction Reactions",
        "Redox Reactions in Terms of Electron Transfer Reactions",
        "Oxidation Number",
        "Redox Reactions and Electrode Processes"
      ]
    },
    {
      "chapter": "Organic Chemistry – Some Basic Principles and Techniques",
      "index": [
        "General Introduction",
        "Tetravalence of Carbon: Shapes of Organic Compounds",
        "Structural Representations of Organic Compounds",
        "Classification of Organic Compounds",
        "Nomenclature of Organic Compounds",
        "Isomerism",
        "Fundamental Concepts in Organic Reaction Mechanism",
        "Methods of Purification of Organic Compounds",
        "Qualitative Analysis of Organic Compounds",
        "Quantitative Analysis"
      ]
    },
    {
      "chapter": "Hydrocarbons",
      "index": [
        "Classification",
        "Alkanes",
        "Alkenes",
        "Alkynes",
        "Aromatic Hydrocarbon",
        "Carcinogenicity and Toxicity"
      ]
    }
  ]
        },
        // Mathematics 
        {
  "subject": "Mathematics",
  "chapters": [
    {
      "chapter": "Sets",
      "index": [
        "Introduction",
        "Sets and their Representations",
        "The Empty Set",
        "Finite and Infinite Sets",
        "Equal Sets",
        "Subsets",
        "Universal Set",
        "Venn Diagrams",
        "Operations on Sets",
        "Complement of a Set"
      ]
    },
    {
      "chapter": "Relations and Functions",
      "index": [
        "Introduction",
        "Cartesian Product of Sets",
        "Relations",
        "Functions"
      ]
    },
    {
      "chapter": "Trigonometric Functions",
      "index": [
        "Introduction",
        "Angles",
        "Trigonometric Functions",
        "Trigonometric Functions of Sum and Difference of Two Angles"
      ]
    },
    {
      "chapter": "Complex Numbers and Quadratic Equations",
      "index": [
        "Introduction",
        "Complex Numbers",
        "Algebra of Complex Numbers",
        "The Modulus and the Conjugate of a Complex Number",
        "Argand Plane and Polar Representation"
      ]
    },
    {
      "chapter": "Linear Inequalities",
      "index": [
        "Introduction",
        "Inequalities",
        "Algebraic Solutions of Linear Inequalities in One Variable and their Graphical Representation"
      ]
    },
    {
      "chapter": "Permutations and Combinations",
      "index": [
        "Introduction",
        "Fundamental Principle of Counting",
        "Permutations",
        "Combinations"
      ]
    },
    {
      "chapter": "Binomial Theorem",
      "index": [
        "Introduction",
        "Binomial Theorem for Positive Integral Indices"
      ]
    },
    {
      "chapter": "Sequences and Series",
      "index": [
        "Introduction",
        "Sequences",
        "Series",
        "Geometric Progression (G.P.)",
        "Relationship Between A.M. and G.M."
      ]
    },
    {
      "chapter": "Straight Lines",
      "index": [
        "Introduction",
        "Slope of a Line",
        "Various Forms of the Equation of a Line",
        "Distance of a Point From a Line"
      ]
    },
    {
      "chapter": "Conic Sections",
      "index": [
        "Introduction",
        "Sections of a Cone",
        "Circle",
        "Parabola",
        "Ellipse",
        "Hyperbola"
      ]
    },
    {
      "chapter": "Introduction to Three Dimensional Geometry",
      "index": [
        "Introduction",
        "Coordinate Axes and Coordinate Planes in Three Dimensional Space",
        "Coordinates of a Point in Space",
        "Distance between Two Points"
      ]
    },
    {
      "chapter": "Limits and Derivatives",
      "index": [
        "Introduction",
        "Intuitive Idea of Derivatives",
        "Limits",
        "Limits of Trigonometric Functions",
        "Derivatives"
      ]
    },
    {
      "chapter": "Statistics",
      "index": [
        "Introduction",
        "Measures of Dispersion",
        "Range",
        "Mean Deviation",
        "Variance and Standard Deviation"
      ]
    },
    {
      "chapter": "Probability",
      "index": [
        "Event",
        "Axiomatic Approach to Probability"
      ]
    }
  ]
        },
        // Biology
        {
  "subject": "Biology",
  "chapters": [
    {
      "chapter": "The Living World",
      "index": []
    },
    {
      "chapter": "Biological Classification",
      "index": []
    },
    {
      "chapter": "Plant Kingdom",
      "index": []
    },
    {
      "chapter": "Animal Kingdom",
      "index": []
    },
    {
      "chapter": "Morphology of Flowering Plants",
      "index": []
    },
    {
      "chapter": "Anatomy of Flowering Plants",
      "index": []
    },
    {
      "chapter": "Structural Organisation in Animals",
      "index": []
    },
    {
      "chapter": "Cell : The Unit of Life",
      "index": []
    },
    {
      "chapter": "Biomolecules",
      "index": []
    },
    {
      "chapter": "Cell Cycle and Cell Division",
      "index": []
    },
    {
      "chapter": "Photosynthesis in Higher Plants",
      "index": []
    },
    {
      "chapter": "Respiration in Plants",
      "index": []
    },
    {
      "chapter": "Plant Growth and Development",
      "index": []
    },
    {
      "chapter": "Breathing and Exchange of Gases",
      "index": []
    },
    {
      "chapter": "Body Fluids and Circulation",
      "index": []
    },
    {
      "chapter": "Excretory Products and their Elimination",
      "index": []
    },
    {
      "chapter": "Locomotion and Movement",
      "index": []
    },
    {
      "chapter": "Neural Control and Coordination",
      "index": []
    },
    {
      "chapter": "Chemical Coordination and Integration",
      "index": []
    }
  ]
        },
        // Psychology
        {
  "subject": "Psychology",
  "chapters": [
    {
      "chapter": "What is Psychology?",
      "index": []
    },
    {
      "chapter": "Methods of Enquiry in Psychology",
      "index": []
    },
    {
      "chapter": "Human Development",
      "index": []
    },
    {
      "chapter": "Sensory, Attentional and Perceptual Processes",
      "index": []
    },
    {
      "chapter": "Learning",
      "index": []
    },
    {
      "chapter": "Human Memory",
      "index": []
    },
    {
      "chapter": "Thinking",
      "index": []
    },
    {
      "chapter": "Motivation and Emotion",
      "index": []
    }
  ]
        },
        // Physics 
        {
  "subject": "Physics",
  "chapters": [
    {
      "chapter": "Units and Measurements",
      "index": [
        "Introduction",
        "The international system of units",
        "Significant figures",
        "Dimensions of physical quantities",
        "Dimensional formulae and dimensional equations",
        "Dimensional analysis and its applications"
      ]
    },
    {
      "chapter": "Motion in a Straight Line",
      "index": [
        "Introduction",
        "Instantaneous velocity and speed",
        "Acceleration",
        "Kinematic equations for uniformly accelerated motion"
      ]
    },
    {
      "chapter": "Motion in a Plane",
      "index": [
        "Introduction",
        "Scalars and vectors",
        "Multiplication of vectors by real numbers",
        "Addition and subtraction of vectors – graphical method",
        "Resolution of vectors",
        "Vector addition – analytical method",
        "Motion in a plane",
        "Motion in a plane with constant acceleration",
        "Projectile motion",
        "Uniform circular motion"
      ]
    },
    {
      "chapter": "Laws of Motion",
      "index": [
        "Introduction",
        "Aristotle's fallacy",
        "The law of inertia",
        "Newton's first law of motion",
        "Newton's second law of motion",
        "Newton's third law of motion",
        "Conservation of momentum",
        "Equilibrium of a particle",
        "Common forces in mechanics",
        "Circular motion",
        "Solving problems in mechanics"
      ]
    },
    {
      "chapter": "Work, Energy and Power",
      "index": [
        "Introduction",
        "Notions of work and kinetic energy: The work-energy theorem",
        "Work",
        "Kinetic energy",
        "Work done by a variable force",
        "The work-energy theorem for a variable force",
        "The concept of potential energy",
        "The conservation of mechanical energy",
        "The potential energy of a spring",
        "Power",
        "Collisions"
      ]
    },
    {
      "chapter": "System of Particles and Rotational Motion",
      "index": [
        "Introduction",
        "Centre of mass",
        "Motion of centre of mass",
        "Linear momentum of a system of particles",
        "Vector product of two vectors",
        "Angular velocity and its relation with linear velocity",
        "Torque and angular momentum",
        "Equilibrium of a rigid body",
        "Moment of inertia",
        "Kinematics of rotational motion about a fixed axis",
        "Dynamics of rotational motion about a fixed axis",
        "Angular momentum in case of rotations about a fixed axis"
      ]
    },
    {
      "chapter": "Gravitation",
      "index": [
        "Introduction",
        "Kepler's laws",
        "Universal law of gravitation",
        "The gravitational constant",
        "Acceleration due to gravity of the earth",
        "Acceleration due to gravity below and above the surface of earth",
        "Gravitational potential energy",
        "Escape speed",
        "Earth satellites",
        "Energy of an orbiting satellite"
      ]
    },
    {
      "chapter": "Mechanical Properties of Solids",
      "index": [
        "Introduction",
        "Stress and strain",
        "Hooke's law",
        "Stress-strain curve",
        "Elastic moduli",
        "Applications of elastic behaviour of materials"
      ]
    },
    {
      "chapter": "Mechanical Properties of Fluids",
      "index": [
        "Introduction",
        "Pressure",
        "Streamline flow",
        "Bernoulli's principle",
        "Viscosity",
        "Surface tension"
      ]
    },
    {
      "chapter": "Thermal Properties of Matter",
      "index": [
        "Introduction",
        "Temperature and heat",
        "Measurement of temperature",
        "Ideal-gas equation and absolute temperature",
        "Thermal expansion",
        "Specific heat capacity",
        "Calorimetry",
        "Change of state",
        "Heat transfer",
        "Newton's law of cooling"
      ]
    },
    {
      "chapter": "Thermodynamics",
      "index": [
        "Introduction",
        "Thermal equilibrium",
        "Zeroth law of thermodynamics",
        "Heat, internal energy and work",
        "First law of thermodynamics",
        "Specific heat capacity",
        "Thermodynamic state variables and equation of state",
        "Thermodynamic processes",
        "Second law of thermodynamics",
        "Reversible and irreversible processes",
        "Carnot engine"
      ]
    },
    {
      "chapter": "Kinetic Theory",
      "index": [
        "Introduction",
        "Molecular nature of matter",
        "Behaviour of gases",
        "Kinetic theory of an ideal gas",
        "Law of equipartition of energy",
        "Specific heat capacity",
        "Mean free path"
      ]
    },
    {
      "chapter": "Oscillations",
      "index": [
        "Introduction",
        "Periodic and oscillatory motions",
        "Simple harmonic motion",
        "Simple harmonic motion and uniform circular motion",
        "Velocity and acceleration in simple harmonic motion",
        "Force law for simple harmonic motion",
        "Energy in simple harmonic motion",
        "The Simple Pendulum"
      ]
    },
    {
      "chapter": "Waves",
      "index": [
        "Introduction",
        "Transverse and longitudinal waves",
        "Displacement relation in a progressive wave",
        "The speed of a travelling wave",
        "The principle of superposition of waves",
        "Reflection of waves",
        "Beats"
      ]
    }
  ]
        },
        // History
        {
  "subject": "History",
  "chapters": [
    {
      "chapter": "Writing and City Life",
      "index": []
    },
    {
      "chapter": "An Empire Across Three Continents",
      "index": []
    },
    {
      "chapter": "Nomadic Empires",
      "index": []
    },
    {
      "chapter": "The Three Orders",
      "index": []
    },
    {
      "chapter": "Changing Cultural Traditions",
      "index": []
    },
    {
      "chapter": "Displacing Indigenous Peoples",
      "index": []
    },
    {
      "chapter": "Paths to Modernisation",
      "index": []
    }
  ]
        },
        // English Woven Words
        {
  "subject": "English: Woven Words",
  "chapters": [
    {
      "chapter": "The Lament",
      "index": []
    },
    {
      "chapter": "A Pair of Mustachios",
      "index": []
    },
    {
      "chapter": "The Rocking-horse Winner",
      "index": []
    },
    {
      "chapter": "The Adventure of the Three Garridebs",
      "index": []
    },
    {
      "chapter": "Pappachi's Moth",
      "index": []
    },
    {
      "chapter": "The Third and Final Continent",
      "index": []
    },
    {
      "chapter": "Glory at Twilight",
      "index": []
    },
    {
      "chapter": "The Luncheon",
      "index": []
    },
    {
      "chapter": "The Peacock",
      "index": []
    },
    {
      "chapter": "Let me Not to the Marriage of True Minds",
      "index": []
    },
    {
      "chapter": "Coming",
      "index": []
    },
    {
      "chapter": "Telephone Conversation",
      "index": []
    },
    {
      "chapter": "The World is too Much With Us",
      "index": []
    },
    {
      "chapter": "Mother Tongue",
      "index": []
    },
    {
      "chapter": "Hawk Roosting",
      "index": []
    },
    {
      "chapter": "For Elkana",
      "index": []
    },
    {
      "chapter": "Refugee Blues",
      "index": []
    },
    {
      "chapter": "Felling of the Banyan Tree",
      "index": []
    },
    {
      "chapter": "Ode to a Nightingale",
      "index": []
    },
    {
      "chapter": "Ajamil and the Tigers",
      "index": []
    },
    {
      "chapter": "My Watch",
      "index": []
    },
    {
      "chapter": "My Three Passions",
      "index": []
    },
    {
      "chapter": "Patterns of Creativity",
      "index": []
    },
    {
      "chapter": "Tribal Verse",
      "index": []
    },
    {
      "chapter": "What is a Good Book?",
      "index": []
    },
    {
      "chapter": "The Story",
      "index": []
    },
    {
      "chapter": "Bridges",
      "index": []
    }
  ]
        },
        // English Hornbill
        {
  "subject": "English: Hornbill",
  "chapters": [
    {
      "chapter": "The Portrait of a Lady",
      "index": []
    },
    {
      "chapter": "A Photograph",
      "index": []
    },
    {
      "chapter": "We're Not Afraid to Die... if We Can All Be Together",
      "index": []
    },
    {
      "chapter": "Discovering Tut: the Saga Continues",
      "index": []
    },
    {
      "chapter": "The Laburnum Top",
      "index": []
    },
    {
      "chapter": "The Voice of the Rain",
      "index": []
    },
    {
      "chapter": "The Ailing Planet: the Green Movement's Role",
      "index": []
    },
    {
      "chapter": "Childhood",
      "index": []
    },
    {
      "chapter": "The Adventure",
      "index": []
    },
    {
      "chapter": "Silk Road",
      "index": []
    },
    {
      "chapter": "Father to Son",
      "index": []
    },
    {
      "chapter": "Note-making",
      "index": []
    },
    {
      "chapter": "Summarising",
      "index": []
    },
    {
      "chapter": "Sub-titling",
      "index": []
    },
    {
      "chapter": "Essay-writing",
      "index": []
    },
    {
      "chapter": "Letter-writing",
      "index": []
    },
    {
      "chapter": "Creative Writing",
      "index": []
    }
  ]
        },
        // English Snapshots 
        {
  "subject": "English: Snapshots",
  "chapters": [
    {
      "chapter": "The Summer of the Beautiful White Horse",
      "index": []
    },
    {
      "chapter": "The Address",
      "index": []
    },
    {
      "chapter": "Mother's Day",
      "index": []
    },
    {
      "chapter": "Birth",
      "index": []
    },
    {
      "chapter": "The Tale of Melon City",
      "index": []
    }
  ]
        },
        // Hindi Antara Part 1
        {
  "subject": "Hindi: Antara Part 1",
  "chapters": [
    {
      "chapter": "प्रेमचंद - ईदगाह",
      "index": []
    },
    {
      "chapter": "अमरकांत - दोपहर का भोजन",
      "index": []
    },
    {
      "chapter": "हरिशंकर परसाई - टार्च बेचनेवाले",
      "index": []
    },
    {
      "chapter": "रांगेय राघव - गूँगे",
      "index": []
    },
    {
      "chapter": "सुधा अरोड़ा - ज्योतिबा फुले",
      "index": []
    },
    {
      "chapter": "ओमप्रकाश वाल्मीकि - खानाबदोश",
      "index": []
    },
    {
      "chapter": "पांडेय बेचन शर्मा 'उग्र' - उसकी माँ",
      "index": []
    },
    {
      "chapter": "भारतेन्दु हरिश्चंद्र - भारतवर्ष की उन्नति कैसे हो सकती है?",
      "index": []
    },
    {
      "chapter": "कबीर - अरे इन दोहुं राह न पाई / बालम, आवो हमारे गेह रे",
      "index": []
    },
    {
      "chapter": "सूरदास - खेलन में को काको गुसैयाँ / मुरली तऊ गुपाल हिं भावति",
      "index": []
    },
    {
      "chapter": "देव - हँसी की चोट / सपना / दरबार",
      "index": []
    },
    {
      "chapter": "सुमित्रानंदन पंत - संध्या के बाद",
      "index": []
    },
    {
      "chapter": "महादेवी वर्मा - जाग तुझको दूर जाना",
      "index": []
    },
    {
      "chapter": "नागार्जुन - बादल को घिरते देखा है",
      "index": []
    },
    {
      "chapter": "श्रीकांत वर्मा - हस्तक्षेप",
      "index": []
    },
    {
      "chapter": "धूमिल - घर में वापसी",
      "index": []
    }
  ]
        },
        // Hindi Aroh Part 1
        {
  "subject": "Hindi: Aroh Part 1",
  "chapters": [
    {
      "chapter": "प्रेमचंद - नमक का दारोगा",
      "index": []
    },
    {
      "chapter": "कृष्णा सोबती - मियाँ नसीरुद्दीन",
      "index": []
    },
    {
      "chapter": "सत्यजित राय - अपू के साथ ढाई साल",
      "index": []
    },
    {
      "chapter": "बालमुकुंद गुप्त - विदाई-संभाषण",
      "index": []
    },
    {
      "chapter": "शेखर जोशी - गलता लोहा",
      "index": []
    },
    {
      "chapter": "मन्नू भंडारी - रजनी",
      "index": []
    },
    {
      "chapter": "कृश्नचंदर - जामुन का पेड़",
      "index": []
    },
    {
      "chapter": "जवाहरलाल नेहरू - भारत माता",
      "index": []
    },
    {
      "chapter": "कबीर - हम तौ एक एक करि जांनां",
      "index": []
    },
    {
      "chapter": "मीरा - मेरे तो गिरधर गोपाल, दूजरो न कोई",
      "index": []
    },
    {
      "chapter": "भवानी प्रसाद मिश्र - घर की याद",
      "index": []
    },
    {
      "chapter": "त्रिलोचन - चंपा काले काले अच्छर नहीं चीन्हती",
      "index": []
    },
    {
      "chapter": "दुष्यंत कुमार - गज़ल",
      "index": []
    },
    {
      "chapter": "अक्क महादेवी - हे भूख! मत चल 2. हे मेरे जूही के फूल जैसे ईश्वर",
      "index": []
    },
    {
      "chapter": "अवतार सिंह पाश - सबसे खतरनाक",
      "index": []
    },
    {
      "chapter": "निर्मला पुतुल - आओ, मिलकर बचाएँ",
      "index": []
    }
  ]
        },
        // Hindi Vitan Part 1
        {
  "subject": "Hindi: Vitan Part 1",
  "chapters": [
    {
      "chapter": "कुमार गंधर्व - भारतीय गायिकाओं में बेजोड़: लता मंगेशकर",
      "index": []
    },
    {
      "chapter": "अनुपम मिश्र - राजस्थान की रजत बूँदें",
      "index": []
    },
    {
      "chapter": "बेबी हालदार - आलो-आँधरि",
      "index": []
    },
    {
      "chapter": "संध्या सिंह - भारतीय कलाएँ",
      "index": []
    }
  ]
        },
        // Hindi Antaral Part 1
        {
  "subject": "Hindi: Antaral Part 1",
  "chapters": [
    {
      "chapter": "मकबूल फ़िदा हुसैन - हुसैन की कहानी अपनी ज़बानी",
      "index": []
    },
    {
      "chapter": "विष्णु प्रभाकर - आवारा मसीहा",
      "index": []
    }
  ]
        },
        // Hindi Abhivyakti Aur Madhyam 
        {
  "subject": "Hindi: Abhivyakti Aur Madhyam",
  "chapters": [
    {
      "chapter": "1. जनसंचार माध्यम",
      "index": []
    },
    {
      "chapter": "2. पत्रकारिता के विविध आयाम",
      "index": []
    },
    {
      "chapter": "3. विभिन्न माध्यमों के लिए लेखन",
      "index": []
    },
    {
      "chapter": "4. पत्रकारीय लेखन के विभिन्न रूप और लेखन प्रक्रिया",
      "index": []
    },
    {
      "chapter": "5. विशेष लेखन: स्वरूप और प्रकार",
      "index": []
    },
    {
      "chapter": "6. कैसे बनती है कविता",
      "index": []
    },
    {
      "chapter": "7. नाटक लिखने का व्याकरण",
      "index": []
    },
    {
      "chapter": "8. कैसे लिखें कहानी",
      "index": []
    },
    {
      "chapter": "9. डायरी लिखने की कला",
      "index": []
    },
    {
      "chapter": "10. कथा-पटकथा",
      "index": []
    },
    {
      "chapter": "11. कैसे करें कहानी का नाट्य रूपांतरण",
      "index": []
    },
    {
      "chapter": "12. कैसे बनता है रेडियो नाटक",
      "index": []
    },
    {
      "chapter": "13. नए और अप्रत्याशित विषयों पर लेखन",
      "index": []
    },
    {
      "chapter": "14. कार्यालयी लेखन और प्रक्रिया",
      "index": []
    },
    {
      "chapter": "15. स्ववृत्त (बायोडेटा) लेखन और रोजगार संबंधी आवेदन पत्र",
      "index": []
    },
    {
      "chapter": "16. कोश: एक परिचय",
      "index": []
    }
  ]
        },
        // Sanskrit Sashwati Part 1
        {
  "subject": "Sanskrit: Sashwati",
  "chapters": [
    {
      "chapter": "1. वेदामृतम्",
      "index": []
    },
    {
      "chapter": "2. परोपकाराय सतां विभूतयः",
      "index": []
    },
    {
      "chapter": "3. मानो हि महतां धनम्",
      "index": []
    },
    {
      "chapter": "4. सौवर्णशकटिका",
      "index": []
    },
    {
      "chapter": "5. आहारविचारः",
      "index": []
    },
    {
      "chapter": "6. सन्ततिप्रबोधनम्",
      "index": []
    },
    {
      "chapter": "7. विज्ञाननौका",
      "index": []
    },
    {
      "chapter": "8. कण्ठामणिक्यम्",
      "index": []
    },
    {
      "chapter": "9. ईशः कुत्रास्ति",
      "index": []
    },
    {
      "chapter": "10. सत्त्वमाहो रजस्तमः",
      "index": []
    },
    {
      "chapter": "11. नवद्रव्याणि",
      "index": []
    }
  ]
        },
        // Sanskrit Bhaswati Part 1
        {
  "subject": "Sanskrit: Bhaswati",
  "chapters": [
    {
      "chapter": "0. मङ्गलम्",
      "index": []
    },
    {
      "chapter": "1. कुशलप्रश्नानम्",
      "index": []
    },
    {
      "chapter": "2. सूक्तिसुधा",
      "index": []
    },
    {
      "chapter": "3. ऋतुचर्या",
      "index": []
    },
    {
      "chapter": "4. वीरः सर्वदमनः",
      "index": []
    },
    {
      "chapter": "5. शुकशावकोदन्तः",
      "index": []
    },
    {
      "chapter": "6. भव्यः सत्याग्रहाश्रमः",
      "index": []
    },
    {
      "chapter": "7. सङ्गीतानुरागी सुब्बण्णः",
      "index": []
    },
    {
      "chapter": "8. वस्त्रविक्रयः",
      "index": []
    },
    {
      "chapter": "9. यद्भूतहितं तत्सत्यम्",
      "index": []
    },
    {
      "chapter": "10. स मे प्रियः",
      "index": []
    },
    {
      "chapter": "11. अथ शिक्षां प्रवक्ष्यामि",
      "index": []
    }
  ]
        },
        // Sanskrit Sahitya Parichay
        {
  "subject": "Sanskrit: Sahitya Prahichay",
  "chapters": [
    {
      "chapter": "1. संस्कृत भाषा—उद्भव एवं विकास",
      "index": []
    },
    {
      "chapter": "2. वैदिक साहित्य",
      "index": []
    },
    {
      "chapter": "3. रामायण, महाभारत एवं पुराण",
      "index": []
    },
    {
      "chapter": "4. महाकाव्य",
      "index": []
    },
    {
      "chapter": "5. ऐतिहासिक महाकाव्य",
      "index": []
    },
    {
      "chapter": "6. काव्य की अन्य विधाएँ",
      "index": []
    },
    {
      "chapter": "7. गद्यकाव्य एवं चम्पूकाव्य",
      "index": []
    },
    {
      "chapter": "8. कथा साहित्य",
      "index": []
    },
    {
      "chapter": "9. नाट्य–साहित्य",
      "index": []
    },
    {
      "chapter": "10. आधुनिक संस्कृत साहित्य",
      "index": []
    },
    {
      "chapter": "11. संस्कृत कवयित्रियाँ",
      "index": []
    },
    {
      "chapter": "12. शास्त्रीय साहित्य",
      "index": []
    }
  ]
        },
        // Geography : Fundamental 
        {
  "subject": "Geography: Fundamental of Physical Geography",
  "chapters": [
    {
      "chapter": "1. Geography as a Discipline",
      "index": []
    },
    {
      "chapter": "2. The Origin and Evolution of the Earth",
      "index": []
    },
    {
      "chapter": "3. Interior of the Earth",
      "index": []
    },
    {
      "chapter": "4. Distribution of Oceans and Continents",
      "index": []
    },
    {
      "chapter": "5. Geomorphic Processes",
      "index": []
    },
    {
      "chapter": "6. Landforms and their Evolution",
      "index": []
    },
    {
      "chapter": "7. Composition and Structure of Atmosphere",
      "index": []
    },
    {
      "chapter": "8. Solar Radiation, Heat Balance and Temperature",
      "index": []
    },
    {
      "chapter": "9. Atmospheric Circulation and Weather Systems",
      "index": []
    },
    {
      "chapter": "10. Water in the Atmosphere",
      "index": []
    },
    {
      "chapter": "11. World Climate and Climate Change",
      "index": []
    },
    {
      "chapter": "12. Water (Oceans)",
      "index": []
    },
    {
      "chapter": "13. Movements of Ocean Water",
      "index": []
    },
    {
      "chapter": "14. Biodiversity and Conservation",
      "index": []
    }
  ]
        },
        // Geography :  India Physical Environment
        {
  "subject": "Geography: India Physical Environment",
  "chapters": [
    {
      "chapter": "1. India — Location",
      "index": []
    },
    {
      "chapter": "2. Structure and Physiography",
      "index": []
    },
    {
      "chapter": "3. Drainage System",
      "index": []
    },
    {
      "chapter": "4. Climate",
      "index": []
    },
    {
      "chapter": "5. Natural Vegetation",
      "index": []
    },
    {
      "chapter": "6. Natural Hazards and Disasters",
      "index": []
    }
  ]
        },
        // Geography : Practical
        {
  "subject": "Geography: Practical Work Geography",
  "chapters": [
    {
      "chapter": "1. Introduction to Maps",
      "index": []
    },
    {
      "chapter": "2. Map Scale",
      "index": []
    },
    {
      "chapter": "3. Latitude, Longitude and Time",
      "index": []
    },
    {
      "chapter": "4. Map Projections",
      "index": []
    },
    {
      "chapter": "5. Topographical Maps",
      "index": []
    },
    {
      "chapter": "6. Introduction to Remote Sensing",
      "index": []
    }
  ]
        },
        // Sociology 1
        {
  "subject": "Sociology: Introducing Sociology",
  "chapters": [
    {
      "chapter": "1. Sociology and Society",
      "index": []
    },
    {
      "chapter": "2. Terms, Concepts and their use in Sociology",
      "index": []
    },
    {
      "chapter": "3. Understanding Social Institutions",
      "index": []
    },
    {
      "chapter": "4. Culture and Socialisation",
      "index": []
    },
    {
      "chapter": "5. Doing Sociology: Research Methods",
      "index": []
    }
  ]
        },
       // Sociology 2
        {
  "subject": "Sociology: Understanding Society",
  "chapters": [
    {
      "chapter": "1. SOCIAL STRUCTURE, STRATIFICATION AND SOCIAL PROCESSES IN SOCIETY",
      "index": []
    },
    {
      "chapter": "2. SOCIAL CHANGE AND SOCIAL ORDER IN RURAL AND URBAN SOCIETY",
      "index": []
    },
    {
      "chapter": "3. ENVIRONMENT AND SOCIETY",
      "index": []
    },
    {
      "chapter": "4. INTRODUCING WESTERN SOCIOLOGISTS",
      "index": []
    },
    {
      "chapter": "5. INDIAN SOCIOLOGISTS",
      "index": []
    }
  ]
        },
        // Politics 1
        {
  "subject": "Political Science: Political Theory",
  "chapters": [
    {
      "chapter": "1. Political Theory: An Introduction",
      "index": []
    },
    {
      "chapter": "2. Freedom",
      "index": []
    },
    {
      "chapter": "3. Equality",
      "index": []
    },
    {
      "chapter": "4. Social Justice",
      "index": []
    },
    {
      "chapter": "5. Rights",
      "index": []
    },
    {
      "chapter": "6. Citizenship",
      "index": []
    },
    {
      "chapter": "7. Nationalism",
      "index": []
    },
    {
      "chapter": "8. Secularism",
      "index": []
    }
  ]
        },
        // Politics 2
        {
  "subject": "Political Science: Indian Constitution At Work",
  "chapters": [
    {
      "chapter": "1. CONSTITUTION: WHY AND HOW?",
      "index": []
    },
    {
      "chapter": "2. RIGHTS IN THE INDIAN CONSTITUTION",
      "index": []
    },
    {
      "chapter": "3. ELECTION AND REPRESENTATION",
      "index": []
    },
    {
      "chapter": "4. EXECUTIVE",
      "index": []
    },
    {
      "chapter": "5. LEGISLATURE",
      "index": []
    },
    {
      "chapter": "6. JUDICIARY",
      "index": []
    },
    {
      "chapter": "7. FEDERALISM",
      "index": []
    },
    {
      "chapter": "8. LOCAL GOVERNMENTS",
      "index": []
    },
    {
      "chapter": "9. CONSTITUTION AS A LIVING DOCUMENT",
      "index": []
    },
    {
      "chapter": "10. THE PHILOSOPHY OF THE CONSTITUTION",
      "index": []
    }
  ]
        },
        // Economics 1
        {
  "subject": "Economics: Indian Economic Development",
  "chapters": [
    {
      "chapter": "1. Indian Economy on the Eve of Independence",
      "index": []
    },
    {
      "chapter": "2. Indian Economy 1950-1990",
      "index": []
    },
    {
      "chapter": "3. Liberalisation, Privatisation and Globalisation: an Appraisal",
      "index": []
    },
    {
      "chapter": "4. Human Capital Formation in India",
      "index": []
    },
    {
      "chapter": "5. Rural Development",
      "index": []
    },
    {
      "chapter": "6. Employment: Growth, Informalisation and other Issues",
      "index": []
    },
    {
      "chapter": "7. Environment and Sustainable Development",
      "index": []
    },
    {
      "chapter": "8. Comparative Development Experiences of India and its Neighbours",
      "index": []
    }
  ]
        },
        // Economics 2
        {
  "subject": "Economics: Statistics for Economics",
  "chapters": [
    {
      "chapter": "1. Introduction",
      "index": []
    },
    {
      "chapter": "2. Collection of Data",
      "index": []
    },
    {
      "chapter": "3. Organisation of Data",
      "index": []
    },
    {
      "chapter": "4. Presentation of Data",
      "index": []
    },
    {
      "chapter": "5. Measures of Central Tendency",
      "index": []
    },
    {
      "chapter": "6. Correlation",
      "index": []
    },
    {
      "chapter": "7. Index Numbers",
      "index": []
    },
    {
      "chapter": "8. Use of Statistical Tools",
      "index": []
    }
  ]
        },
        // Business Studies
        {
  "subject": "Business Studies",
  "chapters": [
    {
      "chapter": "1. Business, Trade and Commerce",
      "index": []
    },
    {
      "chapter": "2. Forms of Business Organisation",
      "index": []
    },
    {
      "chapter": "3. Private, Public and Global Enterprises",
      "index": []
    },
    {
      "chapter": "4. Business Services",
      "index": []
    },
    {
      "chapter": "5. Emerging Modes of Business",
      "index": []
    },
    {
      "chapter": "6. Social Responsibilities of Business and Business Ethics",
      "index": []
    },
    {
      "chapter": "7. Formation of a Company",
      "index": []
    },
    {
      "chapter": "8. Sources of Business Finance",
      "index": []
    },
    {
      "chapter": "9. MSME and Business Entrepreneurship",
      "index": []
    },
    {
      "chapter": "10. Internal Trade",
      "index": []
    },
    {
      "chapter": "11. International Business",
      "index": []
    }
  ]
        },
        // Graphic Design
        {
  "subject": "Graphic Design: The story of graphic design",
  "chapters": [
    {
      "chapter": "All Chapters",
      "index": ["All Important Topics For Class 11th CBSE Exam"]
    }
  ]
        },
        // CCT 
        {
  "subject": "CCT: Computers and Communication Technology",
  "chapters": [
    {
      "chapter": "1. Experiencing the World of CCT",
      "index": []
    },
    {
      "chapter": "2. Components of CCT",
      "index": []
    },
    {
      "chapter": "3. Word Processing Tool",
      "index": []
    },
    {
      "chapter": "4. Electronic Spreadsheet",
      "index": []
    },
    {
      "chapter": "5. Electronic Presentation Tool",
      "index": []
    },
    {
      "chapter": "6. Convergence of CCT",
      "index": []
    },
    {
      "chapter": "7. The Internet",
      "index": []
    },
    {
      "chapter": "8. Soft Skills for Effective Communication",
      "index": []
    },
    {
      "chapter": "9. Web Page Designing Using HTML",
      "index": []
    },
    {
      "chapter": "10. Client-Side Scripting Using JavaScript",
      "index": []
    },
    {
      "chapter": "11. Project Based Learning",
      "index": []
    },
    {
      "chapter": "12. CCT Projects in Local Context",
      "index": []
    },
    {
      "chapter": "13. Emerging Trends in CCT",
      "index": []
    },
    {
      "chapter": "14. Computer Controlled Devices",
      "index": []
    }
  ]
        },
        // Home Science
        {
  "subject": "Home Science: Human Ecology and Family Sciences",
  "chapters": [
    {
      "chapter": "1. Introduction HEFS: Evolution of the Discipline and its Relevance to Quality of Life",
      "index": []
    },
    {
      "chapter": "2. Understanding the Self",
      "index": []
    },
    {
      "chapter": "3. Food, Nutrition, Health and Fitness",
      "index": []
    },
    {
      "chapter": "4. Management of Resources",
      "index": []
    },
    {
      "chapter": "5. Fabrics Around Us",
      "index": []
    },
    {
      "chapter": "6. Media and Communication Technology",
      "index": []
    },
    {
      "chapter": "7. Concerns and Needs in Diverse Contexts",
      "index": []
    },
    {
      "chapter": "8. Nutrition, Health and Well-being",
      "index": []
    },
    {
      "chapter": "9. Our Apparel",
      "index": []
    },
    {
      "chapter": "10. Financial Management and Planning",
      "index": []
    },
    {
      "chapter": "11. Care and Maintenance of Fabrics",
      "index": []
    }
  ]
        },
        // Applied Maths
        {
  "subject": "Applied Mathematics",
  "chapters": [
    {
      "chapter": "1. Numbers and Quantification",
      "index": []
    },
    {
      "chapter": "2. Numerical Application",
      "index": []
    },
    {
      "chapter": "3. Set",
      "index": []
    },
    {
      "chapter": "4. Relations",
      "index": []
    },
    {
      "chapter": "5. Sequences and Series",
      "index": []
    },
    {
      "chapter": "6. Permutations and combinations",
      "index": []
    },
    {
      "chapter": "7. Mathematical and Logical Reasoning",
      "index": []
    },
    {
      "chapter": "8. Calculus",
      "index": []
    },
    {
      "chapter": "9. Probability",
      "index": []
    },
    {
      "chapter": "10. Descriptive Statistics",
      "index": []
    },
    {
      "chapter": "11. Basics of Financial Mathematics",
      "index": []
    },
    {
      "chapter": "12. Coordinate Geometry",
      "index": []
    },
    {
      "chapter": "13. Practical and Project Work",
      "index": []
    }
  ]
        },
        // Biotechnology
        {
  "subject": "Biotechnology",
  "chapters": [
    {
      "chapter": "1. Introduction",
      "index": [
        "1.1 Historical Perspectives",
        "1.2 Applications of Modern Biotechnology",
        "1.3 Biotechnology in India: Academic Prospects and Industrial Scenario"
      ]
    },
    {
      "chapter": "2. Cellular Organelles",
      "index": [
        "2.1 Plasma Membrane",
        "2.2 Cell Wall",
        "2.3 Endomembrane System",
        "2.4 Mitochondria",
        "2.5 Plastids",
        "2.6 Ribosomes",
        "2.7 Microbodies",
        "2.8 Cytoskeleton",
        "2.9 Cilia and Flagella",
        "2.10 Centrosome and Centrioles",
        "2.11 Nucleus",
        "2.12 Chromosome"
      ]
    },
    {
      "chapter": "3. Biomolecules",
      "index": [
        "3.1 Carbohydrates",
        "3.2 Fatty Acids and Lipids",
        "3.3 Amino Acids",
        "3.4 Protein Structure",
        "3.5 Nucleic Acids"
      ]
    },
    {
      "chapter": "4. Enzymes and Bioenergetics",
      "index": [
        "4.1 Enzymes: Classification and Mode of Action",
        "4.2 Brief Introduction to Bioenergetics"
      ]
    },
    {
      "chapter": "5. Cellular Processes",
      "index": [
        "5.1 Cell Signaling",
        "5.2 Metabolic Pathways",
        "5.3 Cell Cycle",
        "5.4 Programmed Cell Death (Apoptosis)",
        "5.5 Cell Differentiation",
        "5.6 Cell Migration"
      ]
    },
    {
      "chapter": "6. Basic Principles of Inheritance",
      "index": [
        "6.1 Introduction to Inheritance",
        "6.2 Linkage and Crossing Over",
        "6.3 Recombination",
        "6.4 Sex-linked Inheritance",
        "6.5 Extrachromosomal Inheritance",
        "6.6 Polyploidy",
        "6.7 Reverse Genetics"
      ]
    },
    {
      "chapter": "7. Basic Processes",
      "index": [
        "7.1 DNA as the Genetic Material",
        "7.2 Prokaryotic and Eukaryotic Gene Organisation",
        "7.3 DNA Replication",
        "7.4 Gene Expression",
        "7.5 Genetic Code",
        "7.6 Translation",
        "7.7 Gene Mutation",
        "7.8 DNA Repair",
        "7.9 Regulation of Gene Expression"
      ]
    },
    {
      "chapter": "8. Genetic Disorder",
      "index": [
        "8.1 Chromosomal Abnormalities and Syndromes",
        "8.2 Monogenic Disorders and Pedigree Mapping",
        "8.3 Polygenic Disorders"
      ]
    },
    {
      "chapter": "9. Introduction to Bioinformatics",
      "index": [
        "9.1 The Utility of Basic Mathematical and Statistical Concepts to Understand Biological Systems and Processes",
        "9.2 Introduction",
        "9.3 Biological Databases",
        "9.4 Genome Informatics",
        "9.5 Role of Artificial Intelligence (AI) in Future"
      ]
    },
    {
      "chapter": "10. Protein Informatics and Cheminformatics",
      "index": [
        "10.1 Protein Informatics",
        "10.2 Cheminformatics"
      ]
    },
    {
      "chapter": "11. Programming and Systems Biology",
      "index": [
        "11.1 Programming in Biology",
        "11.2 Systems Biology"
      ]
    },
    {
      "chapter": "12. Tools and Techniques",
      "index": [
        "12.1 Microscopy",
        "12.2 Centrifugation",
        "12.3 Electrophoresis",
        "12.4 Enzyme-linked Immunosorbent Assay (ELISA)",
        "12.5 Chromatography",
        "12.6 Spectroscopy",
        "12.7 Mass Spectrometry",
        "12.8 Fluorescence in Situ Hybridisation (FISH)",
        "12.9 DNA Sequencing",
        "12.10 DNA Microarray",
        "12.11 Flow Cytometry"
      ]
    }
  ]
        },
        // Informatics Practices 
        {
  "subject": "Informatics Practices",
  "chapters": [
    {
      "chapter": "1. Computer System",
      "index": [
        "1.1 Introduction to Computer System",
        "1.2 Evolution of Computer",
        "1.3 Computer Memory",
        "1.4 Software"
      ]
    },
    {
      "chapter": "2. Emerging Trends",
      "index": [
        "2.1 Introduction to Emerging Trends",
        "2.2 Artificial Intelligence (AI)",
        "2.3 Big Data",
        "2.4 Internet of Things (IoT)",
        "2.5 Cloud Computing",
        "2.6 Grid Computing",
        "2.7 Blockchains"
      ]
    },
    {
      "chapter": "3. Brief Overview of Python",
      "index": [
        "3.1 Introduction to Python",
        "3.2 Python Keywords",
        "3.3 Identifiers",
        "3.4 Variables",
        "3.5 Data Types",
        "3.6 Operators",
        "3.7 Expressions",
        "3.8 Input and Output",
        "3.9 Debugging",
        "3.10 Functions",
        "3.11 if..else Statements",
        "3.12 for Loop",
        "3.13 Nested Loops"
      ]
    },
    {
      "chapter": "4. Working with Lists and Dictionaries",
      "index": [
        "4.1 Introduction to List",
        "4.2 List Operations",
        "4.3 Traversing a List",
        "4.4 List Methods and Built-in Functions",
        "4.5 List Manipulation",
        "4.6 Introduction to Dictionaries",
        "4.7 Traversing a Dictionary",
        "4.8 Dictionary Methods and Built-in Functions",
        "4.9 Manipulating Dictionaries"
      ]
    },
    {
      "chapter": "5. Understanding Data",
      "index": [
        "5.1 Introduction to Data",
        "5.2 Data Collection",
        "5.3 Data Storage",
        "5.4 Data Processing",
        "5.5 Statistical Techniques for Data Processing"
      ]
    },
    {
      "chapter": "6. Introduction to NumPy",
      "index": [
        "6.1 Introduction",
        "6.2 Array",
        "6.3 NumPy Array",
        "6.4 Indexing and Slicing",
        "6.5 Operations on Arrays",
        "6.6 Concatenating Arrays",
        "6.7 Reshaping Arrays",
        "6.8 Splitting Arrays",
        "6.9 Statistical Operations on Arrays",
        "6.10 Loading Arrays from Files",
        "6.11 Saving NumPy Arrays in Files on Disk"
      ]
    },
    {
      "chapter": "7. Database Concepts",
      "index": [
        "7.1 Introduction",
        "7.2 File System",
        "7.3 Database Management System",
        "7.4 Relational Data Model",
        "7.5 Keys in a Relational Database"
      ]
    },
    {
      "chapter": "8. Introduction to Structured Query Language (SQL)",
      "index": [
        "8.1 Introduction",
        "8.2 Structured Query Language (SQL)",
        "8.3 Data Types and Constraints in MySQL",
        "8.4 SQL for Data Definition",
        "8.5 SQL for Data Manipulation",
        "8.6 SQL for Data Query",
        "8.7 Data Updation and Deletion"
      ]
    }
  ]
        },
        // Computer Science
        {
  "subject": "Computer Science",
  "chapters": [
    {
      "chapter": "1. Computer System",
      "index": [
        "1.1 Introduction to Computer System",
        "1.2 Evolution of Computer",
        "1.3 Computer Memory",
        "1.4 Data Transfer between Memory and CPU",
        "1.5 Microprocessors",
        "1.6 Data and Information",
        "1.7 Software",
        "1.8 Operating System"
      ]
    },
    {
      "chapter": "2. Encoding Schemes and Number System",
      "index": [
        "2.1 Introduction",
        "2.2 Number System",
        "2.3 Conversion between Number Systems"
      ]
    },
    {
      "chapter": "3. Emerging Trends",
      "index": [
        "3.1 Introduction",
        "3.2 Artificial Intelligence (AI)",
        "3.3 Big Data",
        "3.4 Internet of Things (IoT)",
        "3.5 Cloud Computing",
        "3.6 Grid Computing",
        "3.7 Blockchains"
      ]
    },
    {
      "chapter": "4. Introduction to Problem Solving",
      "index": [
        "4.1 Introduction",
        "4.2 Steps for Problem Solving",
        "4.3 Algorithm",
        "4.4 Representation of Algorithms",
        "4.5 Flow of Control",
        "4.6 Verifying Algorithms",
        "4.7 Comparison of Algorithm",
        "4.8 Coding",
        "4.9 Decomposition"
      ]
    },
    {
      "chapter": "5. Getting Started with Python",
      "index": [
        "5.1 Introduction to Python",
        "5.2 Python Keywords",
        "5.3 Identifiers",
        "5.4 Variables",
        "5.5 Comments",
        "5.6 Everything is an Object",
        "5.7 Data Types",
        "5.8 Operators",
        "5.9 Expressions",
        "5.10 Statement",
        "5.11 Input and Output",
        "5.12 Type Conversion",
        "5.13 Debugging"
      ]
    },
    {
      "chapter": "6. Flow of Control",
      "index": [
        "6.1 Introduction",
        "6.2 Selection",
        "6.3 Indentation",
        "6.4 Repetition",
        "6.5 Break and Continue Statement",
        "6.6 Nested Loops"
      ]
    },
    {
      "chapter": "7. Functions",
      "index": [
        "7.1 Introduction",
        "7.2 Functions",
        "7.3 User Defined Functions",
        "7.4 Scope of a Variable",
        "7.5 Python Standard Library"
      ]
    },
    {
      "chapter": "8. Strings",
      "index": [
        "8.1 Introduction",
        "8.2 Strings",
        "8.3 String Operations",
        "8.4 Traversing a String",
        "8.5 String Methods and Built-in Functions",
        "8.6 Handling Strings"
      ]
    },
    {
      "chapter": "9. Lists",
      "index": [
        "9.1 Introduction to List",
        "9.2 List Operations",
        "9.3 Traversing a List",
        "9.4 List Methods and Built-in Functions",
        "9.5 Nested Lists",
        "9.6 Copying Lists",
        "9.7 List as Arguments to Function",
        "9.8 List Manipulation"
      ]
    },
    {
      "chapter": "10. Tuples and Dictionaries",
      "index": [
        "10.1 Introduction to Tuples",
        "10.2 Tuple Operations",
        "10.3 Tuple Methods and Built-in Functions",
        "10.4 Tuple Assignment",
        "10.5 Nested Tuples",
        "10.6 Tuple Handling",
        "10.7 Introduction to Dictionaries",
        "10.8 Dictionaries are Mutable",
        "10.9 Dictionary Operations",
        "10.10 Traversing a Dictionary",
        "10.11 Dictionary Methods and Built-in functions",
        "10.12 Manipulating Dictionaries"
      ]
    },
    {
      "chapter": "11. Societal Impact",
      "index": [
        "11.1 Introduction",
        "11.2 Digital Footprints",
        "11.3 Digital Society and Netizen",
        "11.4 Data Protection",
        "11.5 Cyber Crime",
        "11.6 Indian Information Technology Act (IT Act)",
        "11.7 Impact on Health"
      ]
    }
  ]
        },
        // Fine Arts
        {
  "subject": "Fine Arts",
  "chapters": [
    {
      "chapter": "1. Prehistoric Rock Paintings",
      "index": []
    },
    {
      "chapter": "2. Arts of the Indus Valley",
      "index": []
    },
    {
      "chapter": "3. Arts of the Mauryan Period",
      "index": []
    },
    {
      "chapter": "4. Post-Mauryan Trends in Indian Art and Architecture",
      "index": []
    },
    {
      "chapter": "5. Later Mural Traditions",
      "index": []
    },
    {
      "chapter": "6. Temple Architecture and Sculpture",
      "index": []
    },
    {
      "chapter": "7. Indian Bronze Sculpture",
      "index": []
    },
    {
      "chapter": "8. Some Aspects of Indo-Islamic Architecture",
      "index": []
    }
  ]
        },
        // Heritage Craft 1
        {
  "subject": "Heritage Crafts: Living Craft Traditions of India",
  "chapters": [
    {
      "chapter": "1. Crafts at Home",
      "index": []
    },
    {
      "chapter": "2. Local Heritage",
      "index": []
    },
    {
      "chapter": "3. Local Architecture",
      "index": []
    },
    {
      "chapter": "4. Local Market",
      "index": []
    },
    {
      "chapter": "5. Documentation Formats",
      "index": []
    },
    {
      "chapter": "6. Research and Preparation",
      "index": []
    },
    {
      "chapter": "7. Field Work",
      "index": []
    },
    {
      "chapter": "8. Presentation of Data",
      "index": []
    },
    {
      "chapter": "9. Innovations in Design and Processes",
      "index": []
    },
    {
      "chapter": "10. Creating an Aesthetic Environment",
      "index": []
    }
  ]
        },
        // Heritage Craft 2
        {
  "subject": "Heritage Crafts: Exploring the Craft Traditions of India",
  "chapters": [
    {
      "chapter": "1. Crafts at Home",
      "index": []
    },
    {
      "chapter": "2. Local Heritage",
      "index": []
    },
    {
      "chapter": "3. Local Architecture",
      "index": []
    },
    {
      "chapter": "4. Local Market",
      "index": []
    },
    {
      "chapter": "5. Documentation Formats",
      "index": []
    },
    {
      "chapter": "6. Research and Preparation",
      "index": []
    },
    {
      "chapter": "7. Field Work",
      "index": []
    },
    {
      "chapter": "8. Presentation of Data",
      "index": []
    },
    {
      "chapter": "9. Innovations in Design and Processes",
      "index": []
    },
    {
      "chapter": "10. Creating an Aesthetic Environment",
      "index": []
    }
  ]
        },
        // Knowledge Traditions & Practices Of India
        {
  "subject": "Knowledge Traditions and Practices of India",
  "chapters": [
    {
      "chapter": "1. Language and Literature of India",
      "index": []
    },
    {
      "chapter": "2. Indian Philosophical Systems",
      "index": []
    },
    {
      "chapter": "3. Performing Art Traditions in India",
      "index": []
    },
    {
      "chapter": "4. Indian Art and Architecture",
      "index": []
    },
    {
      "chapter": "5. Astronomy in India",
      "index": []
    },
    {
      "chapter": "6. Mathematics in India",
      "index": []
    },
    {
      "chapter": "7. Introducing Ayurveda: the Science of Health and Disease",
      "index": []
    },
    {
      "chapter": "8. Chemistry and Metallurgy in India",
      "index": []
    },
    {
      "chapter": "9. Yoga",
      "index": []
    }
  ]
        },
        // Health and Physical Education
        {
  "subject": "Physical Education: Health & Physical Education",
  "chapters": [
    {
      "chapter": "1 Physical Education",
      "index": []
    },
    {
      "chapter": "2 Understanding Health",
      "index": []
    },
    {
      "chapter": "3 Physical and Physiological Aspects of Physical Education and Sports",
      "index": []
    },
    {
      "chapter": "4 Individual Games",
      "index": []
    },
    {
      "chapter": "5 Team Games",
      "index": []
    },
    {
      "chapter": "6 Yoga and its Relevance in the Modern Times",
      "index": []
    },
    {
      "chapter": "7 Safety and Security",
      "index": []
    },
    {
      "chapter": "8 Health Related Physical Fitness",
      "index": []
    },
    {
      "chapter": "9 Measurement and Evaluation",
      "index": []
    },
    {
      "chapter": "10 Tournaments and Competitions",
      "index": []
    },
    {
      "chapter": "11 Adventure Sports",
      "index": []
    }
  ]
        },
        // Physical Education CBSE Revised 2023
        {
  "subject": "Physical Education: CBSE Revised 2023",
  "chapters": [
    {
      "chapter": "Unit 1: Changing Trends and Career in Physical Education",
      "index": [
        "Concept, Aims & Objectives of Physical Education",
        "Development of Physical Education in India - Post Independence Career Options in Physical Education",
        "Changing Trends in Sports- playing surface, wearable gears and",
        "Career Options in Physical Education",
        "Khelo-India and Fit-India Program"
      ]
    },
    {
      "chapter": "Unit 2: Olympic Value Education",
      "index": [
        "Olympism - Concept and Olympics Values (Excellence, Friendship & Respect)",
        "Olympic Value Education - Joy of Effort, Fair Play, Respect for Others, Pursuit of Excellence, Balance Among Body, Will & Mind",
        "Ancient and Modern Olympics",
        "Olympics - Symbols, Motto, Flag, Oath, and Anthem",
        "Olympic Movement Structure - IOC, NOC, IFS, Other members"
      ]
    },
    {
      "chapter": "Unit 3: Yoga",
      "index": [
        "Meaning & Importance of Yoga",
        "Introduction to Ashtanga Yoga",
        "Yogic Kriyas (Shat Karma)",
        "Pranayama and its types",
        "Active Lifestyle and stress management through Yoga"
      ]
    },
    {
      "chapter": "Unit 4: Physical Education and Sports for Children with Special Needs",
      "index": [
        "Concept of Disability & Disorder",
        "Types of Disability, its causes & nature ( intellectual disabilityphysical disability)",
        "Disability Etiquettes",
        "Aim & Objective of Adaptive Physical Education",
        "Role of various professionals for children with special needs (Counsellor, Occupational Therapist, Physiotherapist, Physical Education Teacher, Speech Therapist & Special Educator)"
      ]
    },
    {
      "chapter": "Unit 5: Physical Fitness, Health, and Wellness",
      "index": [
        "Meaning & importance of Wellness, Health and Physical Fitness.",
        "Components/Dimensions of Wellness, Health and Physical Fitness",
        "Traditional Sports and Regional Games for promoting wellness.",
        "Leadership through physical activity and Sports",
        "Introduction of First Aid - PRICE"
      ]
    },
    {
      "chapter": "Unit 6: Test, Measurement and Evaluation",
      "index": [
        "Define Test, Measurement & Evaluation",
        "Importance of Test, Measurement & Evaluation in Sports",
        "Classification of Test in Physical Education and Sports",
        "Test administration guidelines in Physical Education and Sports",
        "BMI, Waist-Hip Ratio, Skinfold Measures (3-site)"
      ]
    },
    {
      "chapter": "Unit 7: Fundamentals of Anatomy and Physiology in Sports",
      "index": [
        "Definition and importance of Anatomy and Physiology in Exerciseand Sports.",
        "Functions of Skeletal System, Classification of Bones and Types of Joints.",
        "Properties and Functions of Muscles.",
        "Structure and Functions of Circulatory System and Heart.",
        "Structure and Functions of Respiratory System."
      ]
    },
    {
      "chapter": "Unit 8: Fundamentals of Kinesiology and Biomechanics in Sports",
      "index": [
        "Definition and Importance of Kinesiology and Biomechanics imports",
        "Principles of Biomechanics",
        "Kinetics and Kinematics in Sports",
        "Types of Body Movements - Flexion, Extension, Abduction, Adduction, Rotation, Circumduction, Supination & Pronation",
        "Axis and Planes - Concept and its application in body movements"
      ]
    },
    {
      "chapter": "Unit 9: Psychology and Sports",
      "index": [
        "Definition & Importance of Psychology in Physical Education & Sports;",
        "Developmental Characteristics at Different Stages of Development;",
        "Adolescent Problems & their Management;",
        "Team Cohesion and Sports;",
        "Introduction to Psychological Attributes: Attention, Resilience, Mental Toughness"
      ]
    },
    {
      "chapter": "Unit 10: Training and Doping in Sports",
      "index": [
        "Concept and Principles of Sports Training",
        "Training Load: Over Load, Adaptation, and Recovery",
        "Warming-up & Limbering Down - Types, Method & Importance",
        "Concept of Skill, Technique, Tactics & Strategies",
        "Concept of Doping and its disadvantages"
      ]
    }
  ]
        },
        // Physical Education CBSE
        {
  "subject": "Physical Education: CBSE",
  "chapters": [
    {
      "chapter": "Unit I: Changing Trends and Career in Physical Education",
      "index": [
        "Meaning and definition of Physical Education",
        "Aims & Objectives of Physical Education",
        "Career Options in Physical Education",
        "Competitions in various sports at national and international level",
        "Khelo-India Program"
      ]
    },
    {
      "chapter": "Unit II: Olympic Value Education",
      "index": [
        "Olympics, Paralympics and Special Olympics",
        "Olympic Symbols, Ideals, Objectives and Values of Olympism",
        "International Olympic Committee",
        "Indian Olympic Association"
      ]
    },
    {
      "chapter": "Unit III: Physical Fitness, Wellness and Lifestyle",
      "index": [
        "Meaning and Importance of Physical Fitness, Wellness and Lifestyle",
        "Components of physical fitness and Wellness",
        "Components of Health related fitness"
      ]
    },
    {
      "chapter": "Unit IV: Physical Education and Sports for CWSN (Children with Special Needs- Divyang)",
      "index": [
        "Aims and objectives of Adaptive Physical Education",
        "Organization promoting Adaptive Sports (Special Olympics Bharat; Paralympics; Deaflympics)",
        "Concept of Inclusion, its need and Implementation",
        "Role of various professionals for children with special needs (Counselor, Occupational Therapist, Physiotherapist, Physical Education Teacher, Speech Therapist and Special Educator)"
      ]
    },
    {
      "chapter": "Unit V: Yoga",
      "index": [
        "Meaning and Importance of Yoga",
        "Elements of Yoga",
        "Introduction - Asanas, Pranayam, Meditation and Yogic Kriyas",
        "Yoga for concentration and related Asanas (Sukhasana; Tadasana; Padmasana and Shashankasana, Naukasana, Virkshasana (Tree pose), Garudasana (Eagle pose)",
        "Relaxation Techniques for improving concentration - Yog-nidra"
      ]
    },
    {
      "chapter": "Unit VI: Physical Activity and Leadership Training",
      "index": [
        "Leadership Qualities and Role of a Leader",
        "Creating leaders through Physical Education",
        "Meaning, objectives and types of Adventure Sports (Rock Climbing, Tracking, River Rafting, Mountaineering, Surfing and Para Gliding)",
        "Safety measures to prevent sports injuries"
      ]
    },
    {
      "chapter": "Unit VII: Test, Measurement and Evaluation",
      "index": [
        "Define Test, Measurement and Evaluation",
        "Importance of Test, Measurement and Evaluation in Sports",
        "Calculation of BMI and Waist - Hip Ratio",
        "Somato Types (Endomorphy, Mesomorphy & Ectomorphy)",
        "Measurement of health related fitness"
      ]
    },
    {
      "chapter": "Unit VIII: Fundamentals of Anatomy, Physiology and Kinesiology in Sports",
      "index": [
        "Definition and Importance of Anatomy, Physiology and Kinesiology",
        "Function of Skeleton System, Classification of Bones and Types of Joints",
        "Properties and Functions of Muscles",
        "Function and Structure of Respiratory System and Circulatory System",
        "Equilibrium - Dynamic and Static And Centre of Gravity and its application in sports"
      ]
    },
    {
      "chapter": "Unit IX: Psychology and Sports",
      "index": [
        "Definition and Importance of Psychology in Phy. Edu. and Sports",
        "Define and Differentiate Between Growth and Development",
        "Developmental Characteristics at Different Stages of Development",
        "Adolescent Problems and their Management"
      ]
    },
    {
      "chapter": "Unit X: Training and Doping in Sports",
      "index": [
        "Meaning and Concept of Sports Training",
        "Principles of Sports Training",
        "Warming up and limbering down",
        "Skill, Technique and Style",
        "Concept & classification of doping",
        "Prohibited Substances and their side effects",
        "Dealing with alcohol and substance abuse"
      ]
    }
  ]
        },
        // Creative Writing: Srijan - 1
        {
  "subject": "Creative Writing: Srijan - 1",
  "chapters": [
    {
      "chapter": "सृजनात्मकता और लेखन",
      "index": [
        "सृजनात्मकता क्या है?",
        "लेखन में सृजनात्मक अभिव्यक्ति"
      ]
    },
    {
      "chapter": "साहित्यिक लेखन",
      "index": [
        "साहित्यिक लेखन — एक परिचय",
        "साहित्यिक लेखन"
      ]
    },
    {
      "chapter": "मीडिया",
      "index": [
        "मीडिया लेखन का संक्षिप्त परिचय",
        "मीडिया लेखन"
      ]
    },
    {
      "chapter": "अनुवाद",
      "index": [
        "अनुवाद — एक संक्षिप्त परिचय",
        "अनुवाद के विविध रूप"
      ]
    }
  ]
        }
      ]
    },
    {
      "class":"9th",
      "subjects":[
        // Mathematics 
        {
  "subject": "Mathematics",
  "chapters": [
    {
      "chapter": "Number Systems",
      "index": [
        "Introduction",
        "Irrational Numbers",
        "Real Numbers and their Decimal Expansions",
        "Operations on Real Numbers",
        "Laws of Exponents for Real Numbers",
        "Summary"
      ]
    },
    {
      "chapter": "Polynomials",
      "index": [
        "Introduction",
        "Polynomials in One Variable",
        "Zeroes of a Polynomial",
        "Factorisation of Polynomials",
        "Algebraic Identities",
        "Summary"
      ]
    },
    {
      "chapter": "Coordinate Geometry",
      "index": [
        "Introduction",
        "Cartesian System",
        "Summary"
      ]
    },
    {
      "chapter": "Linear Equations in Two Variables",
      "index": [
        "Introduction",
        "Linear Equations",
        "Solution of a Linear Equation",
        "Summary"
      ]
    },
    {
      "chapter": "Introduction to Euclid’s Geometry",
      "index": [
        "Introduction",
        "Euclid’s Definitions, Axioms and Postulates",
        "Summary"
      ]
    },
    {
      "chapter": "Lines and Angles",
      "index": [
        "Introduction",
        "Basic Terms and Definitions",
        "Intersecting Lines and Non-intersecting Lines",
        "Pairs of Angles",
        "Lines Parallel to the Same Line",
        "Summary"
      ]
    },
    {
      "chapter": "Triangles",
      "index": [
        "Introduction",
        "Congruence of Triangles",
        "Criteria for Congruence of Triangles",
        "Some Properties of a Triangle",
        "Some More Criteria for Congruence of Triangles",
        "Summary"
      ]
    },
    {
      "chapter": "Quadrilaterals",
      "index": [
        "Properties of a Parallelogram",
        "The Mid-point Theorem",
        "Summary"
      ]
    },
    {
      "chapter": "Circles",
      "index": [
        "Angle Subtended by a Chord at a Point",
        "Perpendicular from the Centre to a Chord",
        "Equal Chords and their Distances from the Centre",
        "Angle Subtended by an Arc of a Circle",
        "Cyclic Quadrilaterals",
        "Summary"
      ]
    },
    {
      "chapter": "Heron’s Formula",
      "index": [
        "Area of a Triangle – by Heron’s Formula",
        "Summary"
      ]
    },
    {
      "chapter": "Surface Areas and Volumes",
      "index": [
        "Surface Area of a Right Circular Cone",
        "Surface Area of a Sphere",
        "Volume of a Right Circular Cone",
        "Volume of a Sphere",
        "Summary"
      ]
    },
    {
      "chapter": "Statistics",
      "index": [
        "Graphical Representation of Data",
        "Summary"
      ]
    },
    {
      "chapter": "Proofs in Mathematics",
      "index": [
        "Introduction",
        "Mathematically Acceptable Statements",
        "Deductive Reasoning",
        "Theorems, Conjectures and Axioms",
        "What is a Mathematical Proof?",
        "Summary"
      ]
    },
    {
      "chapter": "Introduction to Mathematical Modelling",
      "index": [
        "Introduction",
        "Review of Word Problems",
        "Some Mathematical Models",
        "The Process of Modelling, its Advantages and Limitations",
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
      "chapter": "Matter in Our Surroundings",
      "index": []
    },
    {
      "chapter": "Is Matter Around Us Pure?",
      "index": []
    },
    {
      "chapter": "Atoms and Molecules",
      "index": []
    },
    {
      "chapter": "Structure of the Atom",
      "index": []
    },
    {
      "chapter": "The Fundamental Unit of Life",
      "index": []
    },
    {
      "chapter": "Tissues",
      "index": []
    },
    {
      "chapter": "Motion",
      "index": []
    },
    {
      "chapter": "Force and Laws of Motion",
      "index": []
    },
    {
      "chapter": "Gravitation",
      "index": []
    },
    {
      "chapter": "Work and Energy",
      "index": []
    },
    {
      "chapter": "Sound",
      "index": []
    },
    {
      "chapter": "Improvement in Food Resources",
      "index": []
    }
  ]
        },
        // Information and Communication Technology
        {
  "subject": "Information and Communication Technology",
  "chapters": [
    {
      "chapter": "Introduction to ICT",
      "index": []
    },
    {
      "chapter": "Creating Textual Communication",
      "index": []
    },
    {
      "chapter": "Creating Visual Communication",
      "index": []
    },
    {
      "chapter": "Creating Audio-Video Communication",
      "index": []
    },
    {
      "chapter": "Presenting Ideas",
      "index": []
    },
    {
      "chapter": "Getting Connected: Internet",
      "index": []
    },
    {
      "chapter": "Safety and Security in the Cyber World",
      "index": []
    },
    {
      "chapter": "Fun with Logic",
      "index": []
    }
  ]
        },
        // Physical Education
        {
  "subject": "Physical Education: Health and Physical Education",
  "chapters": [
    {
      "chapter": "Health and Diseases",
      "index": []
    },
    {
      "chapter": "Growing up with Confidence",
      "index": []
    },
    {
      "chapter": "Physical Education",
      "index": []
    },
    {
      "chapter": "Physical Fitness",
      "index": []
    },
    {
      "chapter": "Sports Training",
      "index": []
    },
    {
      "chapter": "Individual Sports",
      "index": []
    },
    {
      "chapter": "Team Games",
      "index": []
    },
    {
      "chapter": "Ethics in Sports",
      "index": []
    },
    {
      "chapter": "Personality Development through Yoga",
      "index": []
    },
    {
      "chapter": "Waste Management",
      "index": []
    },
    {
      "chapter": "Diet for Healthy Living",
      "index": []
    },
    {
      "chapter": "First Aid and Safety",
      "index": []
    },
    {
      "chapter": "Social Health",
      "index": []
    },
    {
      "chapter": "Adolescent Friendly Health Services",
      "index": []
    },
    {
      "chapter": "Appendix Feedback Questionnaire",
      "index": []
    }
  ]
        },
        // Democratic Politics Social Studies
        {
  "subject": "Social Science: Democratic Politics",
  "chapters": [
    {
      "chapter": "WHAT IS DEMOCRACY? WHY DEMOCRACY?",
      "index": []
    },
    {
      "chapter": "CONSTITUTIONAL DESIGN",
      "index": []
    },
    {
      "chapter": "ELECTORAL POLITICS",
      "index": []
    },
    {
      "chapter": "WORKING OF INSTITUTIONS",
      "index": []
    },
    {
      "chapter": "DEMOCRATIC RIGHTS",
      "index": []
    }
  ]
        },
        // Social Studies: Contemporary India
        {
  "subject": "Social Science: Contemporary India",
  "chapters": [
    {
      "chapter": "India – Size and Location",
      "index": []
    },
    {
      "chapter": "Physical Features of India",
      "index": []
    },
    {
      "chapter": "Drainage",
      "index": []
    },
    {
      "chapter": "Climate",
      "index": []
    },
    {
      "chapter": "Natural Vegetation and Wildlife",
      "index": []
    },
    {
      "chapter": "Population",
      "index": []
    }
  ]
        },
        // Social Studies: Economics
        {
  "subject": "Social Science: Economics",
  "chapters": [
    {
      "chapter": "The Story of Village Palampur",
      "index": []
    },
    {
      "chapter": "People as Resource",
      "index": []
    },
    {
      "chapter": "Poverty as a Challenge",
      "index": []
    },
    {
      "chapter": "Food Security in India",
      "index": []
    }
  ]
        },
        // Social Science: India and the Contemporary World-1
        {
  "subject": "Social Science: India and the Contemporary World-1",
  "chapters": [
    {
      "chapter": "The French Revolution",
      "index": []
    },
    {
      "chapter": "Socialism in Europe and the Russian Revolution",
      "index": []
    },
    {
      "chapter": "Nazism and the Rise of Hitler",
      "index": []
    },
    {
      "chapter": "Forest Society and Colonialism",
      "index": []
    },
    {
      "chapter": "Pastoralists in the Modern World",
      "index": []
    },
    {
      "chapter": "Peasants and Farmers",
      "index": []
    },
    {
      "chapter": "History and Sport: The Story of Cricket",
      "index": []
    },
    {
      "chapter": "Clothing: A Social History",
      "index": []
    }
  ]
        },
        // English Beehive
        {
  "subject": "English: Beehive",
  "chapters": [
    {
      "chapter": "The Fun They Had",
      "index": []
    },
    {
      "chapter": "The Road Not Taken",
      "index": []
    },
    {
      "chapter": "The Sound of Music",
      "index": []
    },
    {
      "chapter": "Wind",
      "index": []
    },
    {
      "chapter": "The Little Girl",
      "index": []
    },
    {
      "chapter": "Rain on the Roof",
      "index": []
    },
    {
      "chapter": "A Truly Beautiful Mind",
      "index": []
    },
    {
      "chapter": "The Lake Isle of Innisfree",
      "index": []
    },
    {
      "chapter": "The Snake and the Mirror",
      "index": []
    },
    {
      "chapter": "A Legend of the Northland",
      "index": []
    },
    {
      "chapter": "My Childhood",
      "index": []
    },
    {
      "chapter": "No Men Are Foreign",
      "index": []
    },
    {
      "chapter": "Reach for the Top",
      "index": []
    },
    {
      "chapter": "On Killing a Tree",
      "index": []
    },
    {
      "chapter": "Kathmandu",
      "index": []
    },
    {
      "chapter": "A Slumber Did My Spirit Seal",
      "index": []
    },
    {
      "chapter": "If I Were You",
      "index": []
    }
  ]
        },
        // English Moments
        {
  "subject": "English: Moments",
  "chapters": [
    {
      "chapter": "The Lost Child",
      "index": []
    },
    {
      "chapter": "The Adventures of Toto",
      "index": []
    },
    {
      "chapter": "Iswaran the Storyteller",
      "index": []
    },
    {
      "chapter": "In the Kingdom of Fools",
      "index": []
    },
    {
      "chapter": "The Happy Prince",
      "index": []
    },
    {
      "chapter": "Weathering the Storm in Ersama",
      "index": []
    },
    {
      "chapter": "The Last Leaf",
      "index": []
    },
    {
      "chapter": "A House Is Not a Home",
      "index": []
    },
    {
      "chapter": "The Beggar",
      "index": []
    }
  ]
        },
        // English Words and expressions 1
        {
  "subject": "English: Words and Expressions 1",
  "chapters": [
    {
      "chapter": "Unit 1",
      "index": []
    },
    {
      "chapter": "Unit 2",
      "index": []
    },
    {
      "chapter": "Unit 3",
      "index": []
    },
    {
      "chapter": "Unit 4",
      "index": []
    },
    {
      "chapter": "Unit 5",
      "index": []
    },
    {
      "chapter": "Unit 6",
      "index": []
    },
    {
      "chapter": "Unit 7",
      "index": []
    },
    {
      "chapter": "Unit 8",
      "index": []
    },
    {
      "chapter": "Unit 9",
      "index": []
    }
  ]
        },
        // English Literature Reader CBSE
        {
  "subject": "English: Literature Reader CBSE",
  "chapters": [
    {
      "chapter": "How I Taught My Grandmother to Read, by Sudha Murthy",
      "index": []
    },
    {
      "chapter": "A Dog Named Duke, by William D. Ellis",
      "index": []
    },
    {
      "chapter": "The Man Who Knew Too Much, by Alexander Baron",
      "index": []
    },
    {
      "chapter": "Keeping It from Harold, by P.G. Wodehouse",
      "index": []
    },
    {
      "chapter": "Best Seller, by O.Henry",
      "index": []
    },
    {
      "chapter": "The Brook, by Lord Alfred Tennyson",
      "index": []
    },
    {
      "chapter": "The Road Not Taken, by Robert Frost",
      "index": []
    },
    {
      "chapter": "The Solitary Reaper, by William Wordsworth",
      "index": []
    },
    {
      "chapter": "The Seven Ages, by William Shakespeare",
      "index": []
    },
    {
      "chapter": "Oh, I Wish I'd Looked After Me Teeth, by Pam Ayres",
      "index": []
    },
    {
      "chapter": "Song of The Rain, by Kahlil Gibran",
      "index": []
    },
    {
      "chapter": "Villa for Sale, by Sacha Guitry",
      "index": []
    },
    {
      "chapter": "The Bishop's Candlesticks, by Norman McKinnel",
      "index": []
    }
  ]
        },
        // English Main Course Book CBSE
        {
  "subject": "English: Main Course Book CBSE",
  "chapters": [
    {
      "chapter": "UNIT 1: PEOPLE",
      "index": [
        "Introduction",
        "A. An Exemplary Leader",
        "B. A Burglary Attempt",
        "C. Can You Know People You Haven't Met"
      ]
    },
    {
      "chapter": "Unit 2: ADVENTURE",
      "index": [
        "Introduction",
        "A The Final Flight",
        "B The Sound of the Shell",
        "C Ordeal in the Ocean"
      ]
    },
    {
      "chapter": "Unit 3: ENVIRONMENT",
      "index": [
        "Introduction",
        "A The Indian Rhinoceros",
        "B Save Mother Earth",
        "C Save the Tiger"
      ]
    },
    {
      "chapter": "UNIT 4: THE CLASS IX RADIO AND VIDEO SHOW",
      "index": [
        "A Radio Show",
        "B Video Show"
      ]
    },
    {
      "chapter": "Unit 5: MYSTERY",
      "index": [
        "Introduction",
        "A Bermuda Triangle",
        "B The Invisible Man",
        "C The Tragedy of Birlstone",
        "D Harry Potter"
      ]
    },
    {
      "chapter": "UNIT 6: CHILDREN",
      "index": [
        "Introduction",
        "A. Tom Sawyer",
        "B. Children of India",
        "C. Children and Computers",
        "D. Life Skills",
        "E. We are the World"
      ]
    },
    {
      "chapter": "UNIT 7: SPORTS AND GAMES",
      "index": [
        "Introduction",
        "A. Grandmaster Koneru Humpy Queen of 64 Squares",
        "B. It's Sports Day",
        "C. Hockey and Football"
      ]
    }
  ]
        },
        // English Workbook CBSE
        {
  "subject": "English: Workbook CBSE",
  "chapters": [
    {
      "chapter": "UNIT 1: VERB FORMS",
      "index": []
    },
    {
      "chapter": "UNIT 2: DETERMINERS",
      "index": []
    },
    {
      "chapter": "UNIT 3: FUTURE TIME REFERENCE",
      "index": []
    },
    {
      "chapter": "UNIT 4: MODALS",
      "index": []
    },
    {
      "chapter": "UNIT 5: CONNECTORS",
      "index": []
    },
    {
      "chapter": "UNIT 6: THE PASSIVE",
      "index": []
    },
    {
      "chapter": "UNIT 7: REPORTED SPEECH",
      "index": []
    },
    {
      "chapter": "UNIT 8: PREPOSITIONS",
      "index": []
    },
    {
      "chapter": "SAMPLE QUESTIONS",
      "index": []
    }
  ]
        },
        // Hindi Kshitij
       {
  "subject": "Hindi: Kshitij",
  "chapters": [
    {
      "chapter": "प्रेमचंद - दो बैलों की कथा",
      "index": []
    },
    {
      "chapter": "राहुल सांकृत्यायन - ल्हासा की ओर",
      "index": []
    },
    {
      "chapter": "श्यामाचरण दुबे - उपभोक्तावाद की संस्कृति",
      "index": []
    },
    {
      "chapter": "जाबिर हुसैन - साँवले सपनों की याद",
      "index": []
    },
    {
      "chapter": "हरिशंकर परसाई - प्रेमचंद के फटे जूते",
      "index": []
    },
    {
      "chapter": "महादेवी वर्मा - मेरे बचपन के दिन",
      "index": []
    },
    {
      "chapter": "कबीर - साखियाँ एवं सबद",
      "index": []
    },
    {
      "chapter": "ल्लद्यद - वाख",
      "index": []
    },
    {
      "chapter": "रसखान - सवैये",
      "index": []
    },
    {
      "chapter": "माखनलाल चतुर्वेदी - कैदी और कोकिला",
      "index": []
    },
    {
      "chapter": "सुमित्रानंदन पंत - ग्राम श्री",
      "index": []
    },
    {
      "chapter": "सर्वेश्वर दयाल सक्सेना - मेघ आए",
      "index": []
    },
    {
      "chapter": "राजेश जोशी - बच्चे काम पर जा रहे हैं",
      "index": []
    }
  ]
       },
        // Hindi Sparsh
        {
  "subject": "Hindi: Sparsh",
  "chapters": [
    {
      "chapter": "यशपाल - दुःख का अधिकार",
      "index": []
    },
    {
      "chapter": "बचेन्द्री पाल - एवरेस्ट : मेरी शिखर यात्रा",
      "index": []
    },
    {
      "chapter": "शरद जोशी - तुम कब जाओगे, अतिथि",
      "index": []
    },
    {
      "chapter": "धीरंजन मालवे - वैज्ञानिक चेतना के वाहक चन्द्रशेखर वेंकट रामन्",
      "index": []
    },
    {
      "chapter": "स्वामी आनंद - शुक्रतारे के समान",
      "index": []
    },
    {
      "chapter": "रैदास - पद",
      "index": []
    },
    {
      "chapter": "रहीम - दोहे",
      "index": []
    },
    {
      "chapter": "रामधारी सिंह दिनकर - गीत-अगीत",
      "index": []
    },
    {
      "chapter": "हरिवंशराय बच्चन - अग्नि पथ",
      "index": []
    },
    {
      "chapter": "अरुण कमल - (1) नए इलाके में--- (2) खुशबू रचते हैं हाथ---",
      "index": []
    }
  ]
        },
        // Hindi Kritika Part 1
        {
  "subject": "Hindi: Kritika Part 1",
  "chapters": [
    {
      "chapter": "फणीश्वरनाथ रेणु - इस जल प्रलय में",
      "index": []
    },
    {
      "chapter": "मृदुला गर्ग - मेरे संग की औरतें",
      "index": []
    },
    {
      "chapter": "जगदीश चंद्र माथुर - रीढ़ की हड्डी",
      "index": []
    }
  ]
        },
        // Hindi Sanchayan Part 1
        {
  "subject": "Hindi: Sanchayan part 1",
  "chapters": [
    {
      "chapter": "महादेवी वर्मा - गिल्लू",
      "index": []
    },
    {
      "chapter": "श्रीराम शर्मा - स्मृति",
      "index": []
    },
    {
      "chapter": "के. विक्रम सिंह - कल्लू कुम्हार की उनाकोटी",
      "index": []
    },
    {
      "chapter": "धर्मवीर भारती - मेरा छोटा-सा निजी पुस्तकालय",
      "index": []
    }
  ]
        },
        // Sanskrit Shemushi
        {
  "subject": "Sanskrit: Shemushi",
  "chapters": [
    {
      "chapter": "भारतिवसन्तगीतिः",
      "index": []
    },
    {
      "chapter": "स्वर्णकाकः",
      "index": []
    },
    {
      "chapter": "गोदोहनम्",
      "index": []
    },
    {
      "chapter": "सूक्तिमौक्तिकम्",
      "index": []
    },
    {
      "chapter": "भ्रान्तो बालः",
      "index": []
    },
    {
      "chapter": "लौहतुला",
      "index": []
    },
    {
      "chapter": "सिकतासेतुः",
      "index": []
    },
    {
      "chapter": "जटायोः शौर्यम्",
      "index": []
    },
    {
      "chapter": "पर्यावरणम्",
      "index": []
    },
    {
      "chapter": "वाङ्मनःप्राणस्वरूपम्",
      "index": []
    }
  ]
        },
        // Sanskrit  Abhyaswaan bhav
        {
  "subject": "Sanskrit: Abhyashwaan Bhav",
  "chapters": [
    {
      "chapter": "अपठितावबोधनम्",
      "index": []
    },
    {
      "chapter": "पत्रम्",
      "index": [
        "(क) अनौपचारिकम् पत्रम्",
        "(ख) औपचारिकम् पत्रम्"
      ]
    },
    {
      "chapter": "चित्रवर्णनम्",
      "index": []
    },
    {
      "chapter": "संवादानुच्छेदलेखनम्",
      "index": []
    },
    {
      "chapter": "रचनानुवादः",
      "index": []
    },
    {
      "chapter": "कारकोपपदविभक्तिः",
      "index": []
    },
    {
      "chapter": "सन्धिः",
      "index": []
    },
    {
      "chapter": "उपसर्गाव्ययप्रत्ययाः",
      "index": []
    },
    {
      "chapter": "समासाः",
      "index": []
    },
    {
      "chapter": "शब्दरूपाणि",
      "index": []
    },
    {
      "chapter": "धातुरूपाणि",
      "index": []
    },
    {
      "chapter": "वर्णविचारः",
      "index": []
    }
  ]
        },
        // Sanskrit VyakaranVithi
        {
  "subject": "Sanskrit : VyakaranVithi",
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
      "index": [
        "1. स्वर (अच्) सन्धि",
        "2. व्यञ्जन (हल्) सन्धि",
        "3. विसर्ग सन्धि"
      ]
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
      "index": [
        "1. कृत्प्रत्यय",
        "2. तद्धित प्रत्यय",
        "3. स्त्री प्रत्यय"
      ]
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
      "index": [
        "1. पत्रम्",
        "2. दूरभाषवार्ता",
        "3. अपठित गद्यांश",
        "4. अनुच्छेदलेखनम्",
        "5. निबन्धावली"
      ]
    }
  ]
        },
        // Sanskrit manika cbse
        {
  "subject": "Sanskrit: Manika CBSE",
  "chapters": [
    {
      "chapter": "अथ स्वागतम्",
      "index": []
    },
    {
      "chapter": "वन्दना",
      "index": []
    },
    {
      "chapter": "अविवेकः परमापदां पदम्",
      "index": []
    },
    {
      "chapter": "पाठेयम्",
      "index": []
    },
    {
      "chapter": "विजयतां स्वदेशः",
      "index": []
    },
    {
      "chapter": "विद्या भान्ति सद्गुणाः",
      "index": []
    },
    {
      "chapter": "कर्मणा याति संसिद्धिम्",
      "index": []
    },
    {
      "chapter": "तत् त्वम् असि",
      "index": []
    },
    {
      "chapter": "तरवे नमोऽस्तु",
      "index": []
    },
    {
      "chapter": "न धर्मवृद्धेषु वयः समीक्ष्यते",
      "index": []
    },
    {
      "chapter": "कवयामि वयामि यामि",
      "index": []
    },
    {
      "chapter": "भारतीयं विज्ञानम्",
      "index": []
    },
    {
      "chapter": "भारतेनास्ति मे जीवनं जीवनम्",
      "index": []
    }
  ]
        }


      ]
    } 
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
    // Remove existing data (optional)
    await ClassModel.deleteMany({});
    console.log("Existing classes cleared.");

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
