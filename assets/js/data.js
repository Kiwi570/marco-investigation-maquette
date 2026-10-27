/* Données de la maquette : un seul fichier à mettre à jour.
   Toutes les entrées viennent du site actuel, de la chaîne YouTube et du flux du podcast. */
window.MI_DATA = {
  /* Images Grok déjà reçues (nom de fichier sans extension). Les autres emplacements
     affichent un visuel provisoire dessiné en code. */
  grokReady: [
    "accueil-courrier-carnet", "accueil-ecoles-classe", "accueil-kiosque-journaux", "accueil-redaction-bureau", "accueil-redaction-bureau-mobile",
    "accueil-rotative", "accueil-studio-micro", "enquete-atelier-machines", "enquete-bobines-fil", "enquete-conteneurs", "enquete-coton",
    "enquete-friperie", "enquete-ouverture-vetements", "enquete-ouverture-vetements-mobile", "enquete-reparation", "enquete-teinture",
    "podcast-casque", "podcast-enregistreur", "podcast-ouverture-studio", "podcast-ouverture-studio-mobile"
  ],

  themes: {
    climat: { fr: "Climat & vivant", en: "Climate & living world" },
    mode: { fr: "Mode & consommation", en: "Fashion & consumption" },
    egalite: { fr: "Égalité & discriminations", en: "Equality & discrimination" },
    sante: { fr: "Santé & société", en: "Health & society" },
    monde: { fr: "Monde & démocratie", en: "World & democracy" },
    engagement: { fr: "Engagement & portraits", en: "Commitment & portraits" },
    culture: { fr: "Culture & coulisses", en: "Culture & behind the scenes" }
  },
  formats: {
    video: { fr: "Vidéo", en: "Video" },
    podcast: { fr: "Podcast", en: "Podcast" },
    magazine: { fr: "Magazine", en: "Magazine" },
    formation: { fr: "Formation", en: "Teaching kit" }
  },

  /* Vidéos YouTube, de la plus récente à la plus ancienne (ordre de la chaîne). */
  videos: [
    { id: "6-9VGcvFJWU", img: "melpomene-psychiatrie-deuil", t: "Melpomène : dans les confins de la psychiatrie face au deuil", d: "7:36", th: "sante" },
    { id: "5ignuW4LcxE", img: "albina-du-boisrouvray-vies", t: "La vie aux multiples vies d’Albina du Boisrouvray", d: "59:15", th: "engagement" },
    { id: "RWbONItPHsU", img: "personnel-politique-21e-siecle", t: "La place du personnel politique sur les enjeux du 21e siècle", d: "11:38", th: "monde" },
    { id: "6a904y_YdTM", img: "pourquoi-s-engager", t: "Pourquoi s’engager ?", d: "3:29", th: "engagement" },
    { id: "2zXFlVexTT0", img: "engagement-affaire-de-generation", t: "Engagement, est-ce une affaire de génération ?", d: "48:20", th: "engagement" },
    { id: "4d0B9CAb7Cc", img: "vlog-24h-liberation", t: "Vlog aux 24h de Libération", d: "11:30", th: "culture" },
    { id: "snrNldZhxjM", img: "guerre-ukraine-anna-kudinova", t: "La guerre en Ukraine expliquée, avec Anna Kudinova", d: "22:05", th: "monde", noEmbed: true },
    { id: "-RPVe09ofpk", img: "portrait-albina-du-boisrouvray", t: "Le portrait de vie d’Albina du Boisrouvray", d: "19:30", th: "engagement" },
    { id: "bXK02v8w56E", img: "don-du-corps-science", t: "Peut-on donner son corps à la science ? Laurence Dezélée répond", d: "18:08", th: "sante" },
    { id: "6w-hX_1P-ig", img: "ecologie-influence-charlotte-lemay", t: "Écologie et influence, avec Charlotte Lemay", d: "11:08", th: "climat" },
    { id: "UkR61D2jhCQ", img: "vlog-cannes", t: "Vlog à Cannes", d: "1:09", th: "culture" },
    { id: "wYXAQTBxPh8", img: "academie-du-climat", t: "Temps fort avec l’Académie du Climat", d: "8:03", th: "climat" },
    { id: "vggxuUOGccI", img: "climat-influence-2", t: "Climat et influence (partie 2)", d: "50:13", th: "climat" },
    { id: "7NLk771XWJg", img: "tca-sante-mentale-tedx", t: "TCA et santé mentale, avec TEDx", d: "3:04", th: "sante" },
    { id: "GyNPbir-EFs", img: "climat-influence-1", t: "Climat et influence (partie 1)", d: "54:01", th: "climat" },
    { id: "GLlbqt3zP3g", img: "genocide-ouighours", t: "Le génocide des Ouïghours", d: "9:36", th: "monde" },
    { id: "w34FrmMtrk4", img: "medias-extreme-droite", t: "Les médias d’(extrême) droite fourmillent sur les réseaux sociaux", d: "6:05", th: "monde" },
    { id: "AWbFrSGFG9c", img: "violences-sexistes-sexuelles", t: "Les violences sexistes et sexuelles : interviews exclusives", d: "30:52", th: "egalite" },
    { id: "uDb9zS7_2SA", img: "histoire-des-femmes-genevieve-fraisse", t: "L’histoire des femmes en France, avec Geneviève Fraisse", d: "55:10", th: "egalite" },
    { id: "UchMfgbDnp8", img: "sexisme-inegalites", t: "Sexisme : les inégalités femmes-hommes", d: "7:29", th: "egalite" },
    { id: "9lyIXbbJE3E", img: "sexisme-cliches", t: "Sexisme : les clichés", d: "5:48", th: "egalite" },
    { id: "n5EVlA8J0Dg", img: "genocide-ouighours-decryptage", t: "Le génocide des Ouïghours : décryptage", d: "4:11", th: "monde" },
    { id: "pOwuNSTBBAs", img: "sexisme-vous-en-pensez-quoi", t: "Sexisme : vous en pensez quoi ?", d: "3:47", th: "egalite" },
    { id: "JKxz2ctSk2c", img: "decryptage-cirques", t: "Décryptage sur les cirques", d: "3:48", th: "climat" },
    { id: "LHMXAhmqwKI", img: "fringue-low-cost", t: "Les dessous de la fringue low-cost", d: "", th: "mode", page: "enquete-fast-fashion.html" },
    { id: "yhSH3uwgIL0", img: "nowu-fast-fashion", t: "NowU : ciao la fast-fashion", d: "", th: "mode" },
    { id: "lj7IwPWNf-E", img: "vlog-paris-kaleidoscoop", t: "Vlog in Paris : la remise des prix Kaléïdo’scoop", d: "", th: "culture" },
    { id: "a4KGTdJgMJ0", img: "climat-episode-2", t: "Le climat, épisode 2 : prise de parole à la marche pour le climat", d: "", th: "climat" },
    { id: "sdgveo-IKQ0", img: "climat-episode-1", t: "Le climat, épisode 1 : pourquoi et comment le monde lutte", d: "", th: "climat" }
  ],

  /* Podcast ENGAGEMENT (flux RSS Spotify for Creators). start = début de l'extrait, en secondes (à choisir par Marco). */
  podcast: [
    { n: 1, t: "Engagement, est-ce une affaire de génération", date: "2024-03-23", d: "48:19", th: "engagement", img: "podcast/ep1-engagement-generation", start: 300,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2024-2-22/371890947-44100-2-b2b1eaf754644.mp3",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/Engagement--est-ce-une-affaire-de-gnration-e2hepl9",
      fr: "Comment s’engager, et pour quelles raisons ? Table ronde enregistrée au festival Nos Futurs, organisé avec le journal Le Monde.",
      en: "How and why should we get involved? A round table recorded at the Nos Futurs festival, organised with the newspaper Le Monde." },
    { n: 2, t: "Isabelle Huppert : interview", date: "2023-12-09", d: "55:30", th: "culture", img: "podcast/ep2-isabelle-huppert", start: 240,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2023-11-9/359185216-44100-2-4cccee95c0d51.m4a",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/Isabelle-Huppert--Interview-e2d1bmd",
      fr: "Enregistrée en exclusivité aux 24h de Libé, à la Cité de la Musique : Isabelle Huppert parle de création, de ses prochaines œuvres et de son parcours.",
      en: "Recorded exclusively at Libération’s 24h event at the Cité de la Musique: Isabelle Huppert on creation, her upcoming work and her career." },
    { n: 3, t: "Les nouvelles oratrices", date: "2023-07-01", d: "19:55", th: "egalite", img: "podcast/couverture-engagement", start: 60,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2023-5-25/336768204-44100-2-538aebe409c2a.mp3",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/Les-nouvelles-oratrices-e2663al",
      fr: "Fanny a fondé les Nouvelles Oratrices pour aider les femmes à prendre la parole en public.",
      en: "Fanny founded Les Nouvelles Oratrices to help women speak in public." },
    { n: 4, t: "La dignité, on en parle", date: "2022-11-19", d: "12:02", th: "sante", img: "podcast/couverture-engagement", start: 30,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/production/exports/c6bf17a8/60862152/d6dd4a386cfd70d0182769fc74e66513.m4a",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/La-dignit--on-en-parle-e1qvs88",
      fr: "Les règles, la collecte organisée par Marco, les prisons et le scandale de Fresnes.",
      en: "Periods, the collection Marco organised, prisons and the Fresnes scandal." },
    { n: 5, t: "Précarité étudiante : Maelle témoigne", date: "2022-11-12", d: "14:54", th: "sante", img: "podcast/ep5-precarite-etudiante", start: 45,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2022-10-5/295215134-44100-2-90a17fb8a9a75.mp3",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/Prcarit-tudiante--Maelle-tmoigne-e1qa4dj",
      fr: "Après avoir vu la vidéo TikTok de Maelle, étudiante, Marco l’invite à parler de la précarité étudiante.",
      en: "After seeing student Maelle’s TikTok video, Marco invites her to talk about student poverty." },
    { n: 6, t: "Bande-annonce", date: "2022-10-30", d: "1:09", th: "engagement", img: "podcast/ep6-bande-annonce", start: 0,
      audio: "https://d3ctxlq1ktw2nl.cloudfront.net/staging/2022-9-30/294003386-44100-2-0dd348913e025.m4a",
      url: "https://podcasters.spotify.com/pod/show/gicquel-marc0/episodes/Bande-annonce-e1pvq24",
      fr: "Bienvenue dans ENGAGEMENT : un podcast pour échanger, réfléchir et amener à la réflexion.",
      en: "Welcome to ENGAGEMENT: a podcast to talk, think and get people thinking." }
  ],

  magazines: [
    { key: "climat", t: "Le monde lutte pour le climat", img: "documents/magazine-climat-couverture", th: "climat",
      fr: "Premier magazine, printemps 2021 : pourquoi et comment le monde lutte pour le climat, et des solutions pour demain.",
      en: "First magazine, spring 2021: why and how the world fights climate change, and solutions for tomorrow." },
    { key: "fastfashion", t: "La fast-fashion", img: null, th: "mode",
      fr: "Second magazine, sur la fast-fashion : disponible à l’achat sur Apple Books et Google Play.",
      en: "Second magazine, on fast fashion: available on Apple Books and Google Play." }
  ],

  docs: {
    climatPdf: { local: "assets/docs/magazine-climat.pdf", remote: "https://marcoinvestigation.square.site/uploads/b/783e8070-7634-11ec-8069-8bc356eeeec1/2197be20-7640-11ec-b696-6530d424d02a.pdf" },
    diaporama: { local: "assets/docs/formation-fast-fashion-diaporama.pdf", remote: "https://marcoinvestigation.square.site/uploads/b/783e8070-7634-11ec-8069-8bc356eeeec1/18ec37e0-1642-11ed-9871-ddac57685410.pdf" },
    fiche: { local: "assets/docs/formation-fast-fashion-fiche.pdf", remote: "https://marcoinvestigation.square.site/uploads/b/783e8070-7634-11ec-8069-8bc356eeeec1/4de85dc0-1642-11ed-9871-ddac57685410.pdf" }
  },
  useLocalDocs: true,

  links: {
    youtube: "https://www.youtube.com/@marcoinvestigation",
    instagram: "https://www.instagram.com/marcoinvestigation/",
    tiktok: "https://www.tiktok.com/@marco.investigation",
    spotify: "https://podcasters.spotify.com/pod/show/gicquel-marc0",
    googlePlayClimat: "https://play.google.com/store/books/details/Gicquel_Marco_Le_monde_lutte_pour_le_climat",
    ccijp: "http://www.ccijp.net/communication_reseau/nljuin23/html/page4.html",
    rennesMetropole: "https://fr.calameo.com/read/0054162344db45fe3687d"
  }
};
