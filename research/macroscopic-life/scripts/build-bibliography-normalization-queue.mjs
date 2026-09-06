import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'research/macroscopic-life');
const outDir = path.join(root, 'recovery', 'bibliography-normalization');
fs.mkdirSync(outDir, { recursive: true });

const queue = [
  {id:'west-2015', chapters:[1,5,14], state:'substantially-normalized', locator:'PMID 25964342; PMCID PMC4547252', missing:['DOI verification if retained by style']},
  {id:'bourke-2023', chapters:[5,14], state:'partial', locator:'PMCID PMC10565403', missing:['exact title','journal','volume/issue','pages/article number','DOI','author formatting']},
  {id:'michod-pmc1688438', chapters:[5], state:'partial', locator:'PMCID PMC1688438', missing:['full citation metadata']},
  {id:'michod-pmc1876437', chapters:[5], state:'partial', locator:'PMCID PMC1876437', missing:['full citation metadata']},
  {id:'bioelectricity-pmc8180260', chapters:[7], state:'partial', locator:'PMCID PMC8180260', missing:['authors','year','exact title','journal','volume/issue','pages/article number','DOI']},
  {id:'morphogenesis-pmc4051191', chapters:[8], state:'partial', locator:'PMCID PMC4051191', missing:['full citation metadata']},
  {id:'regeneration-pmc4036467', chapters:[9], state:'partial', locator:'PMCID PMC4036467', missing:['full citation metadata']},
  {id:'trained-immunity-pmc5087274', chapters:[10], state:'partial', locator:'PMCID PMC5087274', missing:['full citation metadata']},
  {id:'circadian-pmc3378387', chapters:[11], state:'partial', locator:'PMCID PMC3378387', missing:['full citation metadata']},
  {id:'kameda-2022', chapters:[12], state:'partial', locator:'Nature Reviews Psychology (2022)', missing:['full author list','exact title','volume/issue','pages','DOI']},
  {id:'hutchins-cognition-in-the-wild', chapters:[12,13], state:'partial', locator:'Edwin Hutchins, Cognition in the Wild', missing:['publication year','publisher','edition if applicable','ISBN optional/style dependent']},
  {id:'pid-pmc10217569', chapters:[12,14], state:'partial', locator:'PMCID PMC10217569', missing:['full citation metadata']},
  {id:'helbing-2013', chapters:[13], state:'partial', locator:'DOI 10.1038/nature12047', missing:['volume/issue/pages','full author/style verification']},
  {id:'franklin-hall', chapters:[14], state:'partial', locator:'DOI 10.1093/bjps/axu040', missing:['publication year','volume/issue/pages','style verification']}
];

const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const payload = {generatedUtc:new Date().toISOString(), policy:'Never fabricate missing metadata. Verify against publication, PubMed/PMC, Crossref, or publisher.', items:queue};
fs.writeFileSync(path.join(outDir, `bibliography-normalization-queue-${stamp}.json`), JSON.stringify(payload,null,2)+'\n');
const md=['# Book One — Bibliography Normalization Queue','',`Generated: ${payload.generatedUtc}`,'','**Rule: Never fabricate missing metadata.**','', '| ID | Chapters | State | Locator | Missing |','|---|---:|---|---|---|'];
for (const q of queue) md.push(`| ${q.id} | ${q.chapters.join(', ')} | ${q.state} | ${q.locator} | ${q.missing.join('; ')} |`);
md.push('','## Completion condition','','Every retained source has style-compliant verified metadata or is explicitly removed/narrowed. No guessed bibliographic field may pass the queue.');
fs.writeFileSync(path.join(outDir, `BIBLIOGRAPHY-NORMALIZATION-QUEUE-${stamp}.md`), md.join('\n')+'\n');
console.log(`Bibliography normalization queue: ${queue.length} anchor records.`);
