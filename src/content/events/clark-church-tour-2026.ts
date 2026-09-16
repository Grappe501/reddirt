export type ChurchTourStop = {
  id: string;
  city: "Gurdon" | "Arkadelphia";
  name: string;
  address: string;
  pastor?: string;
  pastorNote?: string;
  phone?: string;
  serviceHint?: string;
  history: string;
  community: string;
  sourceLabel: string;
  sourceHref: string;
};

function mapsQuery(address: string) {
  return encodeURIComponent(address);
}

export function churchMapsEmbedUrl(address: string) {
  return `https://maps.google.com/maps?q=${mapsQuery(address)}&z=16&output=embed`;
}

export function churchDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery(address)}`;
}

/** Sunday, September 20, 2026 — Clark County field brief. Hosts confirm which sanctuary you enter. */
export const CLARK_CHURCH_TOUR_STOPS: ChurchTourStop[] = [
  {
    id: "ronoake",
    city: "Gurdon",
    name: "Ronoake Baptist Church",
    address: "North end of Ronoake Baptist Church Road, Gurdon, AR 71743",
    pastorNote: "Confirm the pastor on arrival. Public histories name the congregation, not a current pastor.",
    history:
      "Founded near Smithton in 1893 as a historically African American Baptist congregation. Members bought land northeast of Gurdon by 1919. The present Craftsman sanctuary was dedicated July 11, 1945, after the earlier building wore out. It was listed on the National Register of Historic Places on September 23, 2011. The grounds later grew to about five acres with a fellowship hall.",
    community:
      "Ronoake is the National Register church of the Gurdon countryside — a living house of worship for families whose roots run through timber, railroad, and rural Clark County. It is one of Gurdon’s four National Register sites, with the Missouri Pacific Depot, the June Sandidge House, and the Horace Estes House.",
    sourceLabel: "Encyclopedia of Arkansas",
    sourceHref: "https://encyclopediaofarkansas.net/entries/ronoake-baptist-church-13624/",
  },
  {
    id: "gurdon-umc",
    city: "Gurdon",
    name: "Gurdon United Methodist Church",
    address: "201 East Walnut Street, Gurdon, AR 71743",
    pastor: "Micheaul “Mike” L. Proctor",
    pastorNote: "Listed as pastor since July 1, 2019, on the United Methodist Church’s UMData charge record (Gurdon / Center Grove).",
    serviceHint: "Confirm Sunday time with the church office before you walk in.",
    history:
      "Methodism reached Gurdon after the railroad town formed. Encyclopedia of Arkansas notes that when the first minister arrived in 1881 he found about 500 people, three saloons, and no churches. Several congregations were organized in the 1880s as the timber and rail town settled.",
    community:
      "The Walnut Street sanctuary sits in downtown Gurdon, the second-largest city in Clark County and a timber / rail town that still feeds Arkadelphia’s workforce. This is the mainline Methodist stop if the morning includes a Gurdon downtown greeting.",
    sourceLabel: "UMData church profile",
    sourceHref: "https://www.umdata.org/church?church=700323",
  },
  {
    id: "gurdon-fbc",
    city: "Gurdon",
    name: "First Baptist Church (BMA) — Gurdon",
    address: "209 East Pine Street, Gurdon, AR 71743",
    phone: "(870) 353-4421",
    pastorNote: "Do not publish an old 2015 pastor listing as current. Confirm the pastor at the door.",
    history:
      "A Baptist Missionary Association congregation on East Pine, one block off Gurdon’s downtown grid. It is the in-town Baptist counterpart to rural Ronoake.",
    community:
      "Gurdon’s churches grew with the mills and the Missouri Pacific line. A Sunday stop here is a Main Street / Pine Street greeting, not a campus event.",
    sourceLabel: "Public church directory listings for 209 E. Pine",
    sourceHref: "https://www.churchfinder.com/churches/ar/gurdon/first-baptist-church-bma",
  },
  {
    id: "fbc-ark",
    city: "Arkadelphia",
    name: "First Baptist Church of Arkadelphia",
    address: "116 North 7th Street, Arkadelphia, AR 71923",
    pastor: "Jimmy Darby",
    pastorNote: "Named senior pastor on the church’s own site.",
    phone: "(870) 246-5587",
    serviceHint: "Sunday Bible study 9:15 a.m. Worship 10:30 a.m. (church website).",
    history:
      "Organized July 15, 1851, when sixteen people met because the Clark County seat had no Baptist church. The town sat on the Ouachita bluff along the Little Rock–to–Texas road. Church historian Ray Granade wrote the public history the congregation still posts.",
    community:
      "This is the long-running downtown Baptist church of the county seat, a few blocks from the courthouse square and Ouachita Baptist University. It is a natural late-morning stop if the tour is still in Arkadelphia at 10:30.",
    sourceLabel: "First Baptist Church Arkadelphia — Our History",
    sourceHref: "https://www.fbcark.org/history",
  },
  {
    id: "fumc-ark",
    city: "Arkadelphia",
    name: "First United Methodist Church of Arkadelphia",
    address: "107 North 9th Street, Arkadelphia, AR 71923",
    pastor: "Rev. Zeke Allen",
    pastorNote: "Appointed July 1, 2022, per the church’s About page.",
    phone: "(870) 246-2493",
    serviceHint: "NewSong 9:00 a.m. Traditional 11:00 a.m. (church website).",
    history:
      "FUMC is the downtown United Methodist congregation of the county seat. Rev. Allen’s public bio says he has served in United Methodist ministry since 1996 and came to Arkadelphia from earlier appointments including Maumelle and Benton.",
    community:
      "Two Sunday services make this a flexible greeting: 9:00 if you are coming north from Gurdon early, or 11:00 if you stay through First Baptist’s 10:30 hour. The building is two blocks from First Baptist.",
    sourceLabel: "First United Methodist Church Arkadelphia",
    sourceHref: "https://www.fumcark.org/about-us/",
  },
  {
    id: "st-paul-ame",
    city: "Arkadelphia",
    name: "St. Paul AME Church",
    address: "1505 Caddo Street, Arkadelphia, AR 71923",
    phone: "(870) 246-2820",
    pastorNote: "Confirm the pastor on arrival. Directory listings do not name a current pastor we can stand behind.",
    history:
      "St. Paul is Arkadelphia’s African Methodist Episcopal congregation on Caddo Street, in the historic African American neighborhood west of downtown. AME churches in Clark County go back to Reconstruction-era organizing; Providence AME near the Kansas community southeast of Gurdon dates to 1869.",
    community:
      "If the multi-church tour includes a Caddo Street stop, this is the AME house. Treat it as a congregation with its own clock and hospitality — not a campaign hall.",
    sourceLabel: "Public listings for 1505 Caddo Street",
    sourceHref: "https://www.churchfinder.com/churches/ar/arkadelphia/saint-paul-m-e-church",
  },
  {
    id: "second-baptist",
    city: "Arkadelphia",
    name: "Second Baptist Church",
    address: "810 South 12th Street, Arkadelphia, AR 71923",
    pastor: "Faron Rogers",
    pastorNote: "Listed as religious leader on public church directories. Confirm at the church.",
    phone: "(870) 246-4371",
    history:
      "Second Baptist stands on South 12th Street, south of the downtown campus and courthouse core. It is a separate Baptist fellowship from First Baptist on 7th Street.",
    community:
      "A southside greeting if the morning includes more than the downtown pair. Do not assume the same service hour as First Baptist.",
    sourceLabel: "Public directory listing",
    sourceHref: "https://www.churchunion.us/company-second-baptist-church-in-arkadelphia-ar-38303",
  },
  {
    id: "park-hill",
    city: "Arkadelphia",
    name: "Park Hill Baptist Church",
    address: "3163 Hollywood Road, Arkadelphia, AR 71923",
    pastor: "Craig Seals",
    pastorNote: "Listed as pastor in public professional listings. Confirm on site.",
    phone: "(870) 246-4802",
    serviceHint: "Sunday School 9:15 a.m. Worship 10:30 a.m. (church website).",
    history:
      "Park Hill is the Hollywood Road Baptist congregation on the west side of town, off Pine / U.S. 67 toward the bypass. The church’s own visit page is the address source (3163 Hollywood Road).",
    community:
      "A west-side family church with nursery and children’s church. Use it if the tour includes a Hollywood Road greeting after downtown.",
    sourceLabel: "Park Hill Baptist — Plan a Visit",
    sourceHref: "https://www.parkhillbaptist.com/plan-a-visit",
  },
  {
    id: "first-pres",
    city: "Arkadelphia",
    name: "First Presbyterian Church",
    address: "1220 Pine Street, Arkadelphia, AR 71923",
    phone: "(870) 246-4421",
    pastorNote: "Confirm the current teaching elder with the church office.",
    history:
      "Presbyterians organized in Arkadelphia in 1857. A later congregation history (Ouachita honors thesis drawing on the church’s 1958 centennial pamphlet) says fourteen charter members called Rev. A. Beatties, the first minister licensed in Ouachita Presbytery, who also taught school. The first brick building doubled as that school.",
    community:
      "First Presbyterian sits on Pine Street between downtown and Ouachita. It has been the main Presbyterian congregation in Clark County for more than a century and a half.",
    sourceLabel: "PC(USA) congregation record; OBU honors thesis on Clark County Presbyterianism",
    sourceHref: "https://pcusa.org/congregation/first-church-arkadelphia-ar",
  },
  {
    id: "st-mary",
    city: "Arkadelphia",
    name: "Saint Mary Catholic Church",
    address: "251 North 14th Street, Arkadelphia, AR 71923",
    pastor: "Fr. Mark Wood",
    pastorNote: "Listed on current Mass-times directories as pastor of this Diocese of Little Rock parish. Confirm at the parish.",
    phone: "(870) 246-7575",
    serviceHint: "Sunday Mass listed at 11:00 a.m. and 2:00 p.m. (English and Spanish ministry). Confirm before you go.",
    history:
      "Saint Mary is the Catholic parish for Arkadelphia and a bilingual parish of the Diocese of Little Rock. Directories also note a relationship with St. John the Baptist in Malvern.",
    community:
      "This is the stop for Hispanic families and Catholic students around Ouachita and Henderson. A 2:00 p.m. Mass would collide with the 1:30 p.m. departure for De Queen — do not plan to stay for it.",
    sourceLabel: "Parish / Mass-times listings",
    sourceHref: "https://www.catholicchurchtimes.com/church/4045a14b-35d1-4736-ad59-4f1e6e85fd5c",
  },
];

export const CLARK_CHURCH_TOUR_STEPS = [
  {
    time: "By 8:45 a.m.",
    title: "In Gurdon",
    detail:
      "Be on the ground in Gurdon. Ronoake is north of town on Ronoake Baptist Church Road. Downtown churches are on Walnut and Pine.",
  },
  {
    time: "9:15–11:00 a.m.",
    title: "Gurdon greetings",
    detail:
      "Typical Sunday school / worship window. Enter only the sanctuaries the host has opened. Do not campaign from the pulpit unless invited.",
  },
  {
    time: "About 20 minutes",
    title: "Gurdon to Arkadelphia",
    detail: "U.S. 67 north. About 16 miles. Do not linger past the last Gurdon handshake if Arkadelphia still has a late-morning service.",
  },
  {
    time: "10:30 a.m. / 11:00 a.m.",
    title: "Arkadelphia downtown",
    detail:
      "First Baptist worship is posted at 10:30. First United Methodist traditional is posted at 11:00. St. Paul AME is on Caddo. Confirm which door you use.",
  },
  {
    time: "No later than 1:30 p.m.",
    title: "Leave Arkadelphia",
    detail:
      "Hard leave. De Queen Meet & Greet is 4:00–6:00 p.m. at the Downtown Pavilion, 124 W. DeQueen Avenue. Arkadelphia to De Queen is about two hours. A 1:30 departure lands you there with a little air. Later than that cuts the greeting.",
  },
  {
    time: "4:00–6:00 p.m.",
    title: "De Queen",
    detail: "Next public event of the day. Do not stay in Clark County for a 2:00 p.m. Mass or a long lunch.",
  },
];
