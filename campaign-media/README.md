# County photo drop

Put campaign stills in a folder named for the county. Johnson County is the first example:

`campaign-media/Johnson-county/`

Folder name is the county. These also work: `Baxter`, `VanBuren`, `Johnson County`.

Do not invent event or city names in the filenames. After you add a folder, ingest with:

`npm run photos:ingest-county-drops`

from `RedDirt`. That writes web-sized copies to `/campaign-photos`.
