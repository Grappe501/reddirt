/**
 * Concise plain-language explainer of what the office does.
 * Campaign platform lives on /priorities — this page is civic education.
 * Duties drawn from the Arkansas Secretary of State’s published division descriptions,
 * Business & Commercial Services, and the State Board of Election Commissioners’ split of work with counties.
 */

export const officeExplainerCopy = {
  hero: {
    eyebrow: "The Office",
    title: "What the Secretary of State does",
    subtitle:
      "Arkansas’s Secretary of State is a constitutional officer. The job is to run a statewide service organization: elections support, business filings, notaries, public records, and the State Capitol.",
  },
  functions: [
    {
      title: "Elections",
      body: "State law names the Secretary of State the chief election official. The Elections Division keeps statewide election records, maintains Arkansas’s uniform voter registration system, and helps county officials run federal, state, and district elections. The office receives candidate filings and ballot-measure petitions, certifies what goes on the ballot, compiles county returns, and reports results. It also trains on voting equipment and interprets election law for counties. The Secretary of State chairs the State Board of Election Commissioners. County clerks and county boards still run polling places in all 75 counties.",
      href: "/office/elections",
    },
    {
      title: "Business & Commercial Services",
      body: "Business and Commercial Services is the state’s filing office for people who form or operate companies in Arkansas. Filers search a name, file articles for corporations, LLCs, partnerships, and nonprofits, and keep annual reports and franchise tax current. The division records Uniform Commercial Code filings, trademarks and service marks, and other commercial documents. Counter service is in Little Rock’s Victory Building, with a Northwest Arkansas office in Fayetteville.",
      href: "/office/business",
    },
    {
      title: "Notaries & authentications",
      body: "The office commissions Arkansas notaries, keeps the public notary search, and publishes the notary handbook, exam, and complaint process. An Arkansas notary verifies identity and witnesses oaths, testimony, or signatures on legal documents. The office also commissions eNotaries and remote online notarization, and issues apostilles and authentications so notarized documents can be used abroad.",
      href: "/office/notaries",
    },
    {
      title: "Initiatives & referenda",
      body: "When Arkansans use the constitutional initiative or referendum process, this office handles the administrative steps assigned by law: petition forms, filing, signature review, and certification of measures that qualify for the ballot. Popular-name and ballot-title work begins with the Attorney General. Counties still verify many local petitions.",
      href: "/direct-democracy/ballot-initiative-process",
    },
    {
      title: "Public records & the official library",
      body: "The office files and keeps records the public uses every day: the Arkansas Administrative Code and Arkansas Register, journals and acts of the Legislature, city incorporations and annexations, precinct maps, and ethics filings that candidates and officials submit through the state’s ethics process. It also attests official acts and affixes the state seal to commissions. The Arkansas Ethics Commission remains the ethics regulator; this office is the public filing and search desk.",
      href: "/office/records",
    },
    {
      title: "The State Capitol",
      body: "Capitol Facilities cares for the State Capitol, the Capitol Hill Building, and the grounds. State Capitol Police provide security for the building and police services for the Capitol Complex. Communications and Education run tours, exhibits, voter-outreach materials, and civics programs. The Business Office handles purchasing, mail, insurance on buildings under this office’s care, and the lawful distribution of Arkansas and U.S. flags.",
      href: "/office/capitol",
    },
  ],
  closer:
    "Those are the duties of the office as published by the state. Kelly’s plan for how she would run them is on My Plan.",
} as const;
