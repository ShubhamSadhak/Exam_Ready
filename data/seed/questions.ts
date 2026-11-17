import type { QuestionRecord } from '../../shared/types.ts';

export const QUESTIONS: QuestionRecord[] = [
  // ==========================================
  // VOCABULARY (15 questions: 5 Easy, 5 Medium, 5 Hard)
  // ==========================================
  {
    id: 'voc-01',
    skill: 'vocabulary',
    difficulty: 1,
    topic: 'Time & Daily Schedule',
    prompt: 'What does "halb acht" mean when telling time in German?',
    options: ['07:30', '08:30', '08:15', '07:45'],
    correctIndex: 0,
    explanation:
      'In German, "halb acht" means halfway to eight, which is 7:30 (half past seven).',
  },
  {
    id: 'voc-02',
    skill: 'vocabulary',
    difficulty: 1,
    topic: 'Family & People',
    prompt: 'Choose the correct German word for "parents":',
    options: ['die Geschwister', 'die Eltern', 'die Großeltern', 'die Verwandten'],
    correctIndex: 1,
    explanation:
      '"Die Eltern" means parents. "Geschwister" means siblings, and "Großeltern" means grandparents.',
  },
  {
    id: 'voc-03',
    skill: 'vocabulary',
    difficulty: 1,
    topic: 'Food & Drink',
    prompt: 'Which item belongs in a bakery ("Bäckerei")?',
    options: ['das Brötchen', 'das Hemd', 'der Schlüssel', 'die Briefmarke'],
    correctIndex: 0,
    explanation:
      '"Das Brötchen" is a bread roll, bought at a bakery. "Hemd" (shirt), "Schlüssel" (key), and "Briefmarke" (stamp) are everyday objects.',
  },
  {
    id: 'voc-04',
    skill: 'vocabulary',
    difficulty: 1,
    topic: 'Numbers & Prices',
    prompt: '"Das Ticket kostet vierundzwanzig Euro." How much is the ticket?',
    options: ['14 €', '24 €', '42 €', '34 €'],
    correctIndex: 1,
    explanation:
      'German reads two-digit numbers from ones to tens: "vier-und-zwanzig" = 4 + 20 = 24.',
  },
  {
    id: 'voc-05',
    skill: 'vocabulary',
    difficulty: 1,
    topic: 'Everyday Signs',
    prompt: 'You see a sign on a shop door that says "Eingang". What is it?',
    options: ['Exit', 'Closed', 'Entrance', 'Elevator'],
    correctIndex: 2,
    explanation:
      '"Der Eingang" is the entrance ("hinein" = in). "Der Ausgang" is the exit.',
  },
  {
    id: 'voc-06',
    skill: 'vocabulary',
    difficulty: 2,
    topic: 'Shopping & Errands',
    prompt: 'Complete the sentence at a café: "Ich möchte gern bezahlen. Die ___, bitte!"',
    options: ['Rechnung', 'Zeitung', 'Wohnung', 'Haltestelle'],
    correctIndex: 0,
    explanation:
      '"Die Rechnung, bitte!" means "The bill/check, please!" "Zeitung" is newspaper, "Wohnung" is apartment, and "Haltestelle" is bus/tram stop.',
  },
  {
    id: 'voc-07',
    skill: 'vocabulary',
    difficulty: 2,
    topic: 'Travel & Transport',
    prompt: 'At the train station, what does "Abfahrt: Gleis 4" tell you?',
    options: [
      'The train arrives at platform 4.',
      'The train departs from platform 4.',
      'Ticket sales are at counter 4.',
      'Luggage lockers are in row 4.',
    ],
    correctIndex: 1,
    explanation:
      '"Die Abfahrt" means departure and "das Gleis" means track/platform. Arrival is "die Ankunft".',
  },
  {
    id: 'voc-08',
    skill: 'vocabulary',
    difficulty: 2,
    topic: 'Housing & Rooms',
    prompt: 'Which word fits: "In der ___ steht ein großer Tisch mit vier Stühlen."',
    options: ['Küche', 'Tasche', 'Jacke', 'Brille'],
    correctIndex: 0,
    explanation:
      '"Die Küche" (kitchen) is a room where a table and chairs stand. The other three are personal items (bag, jacket, glasses).',
  },
  {
    id: 'voc-09',
    skill: 'vocabulary',
    difficulty: 2,
    topic: 'Health & Appointments',
    prompt: 'Which German sentence means "I need an appointment with the doctor"?',
    options: [
      'Ich brauche einen Termin beim Arzt.',
      'Ich suche ein Zimmer im Hotel.',
      'Ich kaufe eine Fahrkarte am Automat.',
      'Ich schreibe eine Postkarte an meine Oma.',
    ],
    correctIndex: 0,
    explanation:
      '"Einen Termin beim Arzt" means an appointment at the doctor\'s office.',
  },
  {
    id: 'voc-10',
    skill: 'vocabulary',
    difficulty: 2,
    topic: 'Everyday Verbs',
    prompt: 'Choose the best opposite of "früh aufstehen" (to get up early):',
    options: [
      'spät schlafen gehen',
      'schnell laufen',
      'laut sprechen',
      'oft einkaufen',
    ],
    correctIndex: 0,
    explanation:
      '"Früh" (early) contrasts with "spät" (late), and "aufstehen" (get up) contrasts with "schlafen gehen" (go to sleep).',
  },
  {
    id: 'voc-11',
    skill: 'vocabulary',
    difficulty: 3,
    topic: 'Work & Free Time',
    prompt: 'Which noun pairs naturally with the verb "ausfüllen" in an A1 exam form?',
    options: [
      'das Formular',
      'das Frühstück',
      'der Bahnhof',
      'die Musik',
    ],
    correctIndex: 0,
    explanation:
      '"Ein Formular ausfüllen" means to fill out a form—a key A1 verb-noun collocation tested in Goethe/ÖSD Writing Part 1.',
  },
  {
    id: 'voc-12',
    skill: 'vocabulary',
    difficulty: 3,
    topic: 'Polite Requests & Offers',
    prompt: 'Someone says: "Vielen Dank für deine Hilfe!" What is the most natural A1 reply?',
    options: [
      'Gern geschehen!',
      'Gute Besserung!',
      'Herzlichen Glückwunsch!',
      'Auf Wiederhören!',
    ],
    correctIndex: 0,
    explanation:
      '"Gern geschehen!" means "You\'re welcome!" "Gute Besserung" is "Get well soon", and "Herzlichen Glückwunsch" is "Congratulations".',
  },
  {
    id: 'voc-13',
    skill: 'vocabulary',
    difficulty: 3,
    topic: 'Everyday Signs',
    prompt: 'A museum sign reads: "Fotografieren verboten — außer im Garten." What is allowed?',
    options: [
      'Taking photos everywhere inside the museum',
      'Taking photos only in the garden',
      'Taking photos only without flash',
      'Taking photos is not allowed anywhere',
    ],
    correctIndex: 1,
    explanation:
      '"Verboten" means forbidden, and "außer" means "except". So photography is forbidden except in the garden.',
  },
  {
    id: 'voc-14',
    skill: 'vocabulary',
    difficulty: 3,
    topic: 'Weather & Seasons',
    prompt: 'Complete the sentence: "Nimm heute einen Regenschirm mit, es ist sehr ___ und es regnet."',
    options: ['windig', 'sonnig', 'lecker', 'teuer'],
    correctIndex: 0,
    explanation:
      '"Windig" (windy) fits rainy weather when you need an umbrella ("Regenschirm"). "Sonnig" means sunny, "lecker" delicious, "teuer" expensive.',
  },
  {
    id: 'voc-15',
    skill: 'vocabulary',
    difficulty: 3,
    topic: 'Time Expressions',
    prompt: 'Today is Dienstag. When is "übermorgen"?',
    options: ['Montag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    correctIndex: 2,
    explanation:
      '"Morgen" is tomorrow (Mittwoch), and "übermorgen" is the day after tomorrow (Donnerstag).',
  },

  // ==========================================
  // GRAMMAR (15 questions: 5 Easy, 5 Medium, 5 Hard)
  // ==========================================
  {
    id: 'gram-01',
    skill: 'grammar',
    difficulty: 1,
    topic: 'Verb Conjugation (sein / haben)',
    prompt: 'Complete the sentence: "Wir ___ heute leider keine Zeit."',
    options: ['haben', 'habt', 'hat', 'habe'],
    correctIndex: 0,
    explanation:
      'For "wir" (we), the verb "haben" takes the plural form "haben" ("wir haben").',
  },
  {
    id: 'gram-02',
    skill: 'grammar',
    difficulty: 1,
    topic: 'Articles & Gender',
    prompt: 'Choose the correct article: "Das ist ___ Buch."',
    options: ['ein', 'eine', 'einen', 'einer'],
    correctIndex: 0,
    explanation:
      '"Buch" is neuter ("das Buch"), so the indefinite article in the nominative is "ein".',
  },
  {
    id: 'gram-03',
    skill: 'grammar',
    difficulty: 1,
    topic: 'Personal Pronouns',
    prompt: 'Complete the dialogue: "Woher kommst ___?" — "Ich komme aus Österreich."',
    options: ['du', 'er', 'sie', 'ihr'],
    correctIndex: 0,
    explanation:
      'The verb ending "-st" ("kommst") matches the informal singular pronoun "du".',
  },
  {
    id: 'gram-04',
    skill: 'grammar',
    difficulty: 1,
    topic: 'Negation (nicht / kein)',
    prompt: 'Choose the right word: "Ich trinke ___ Kaffee, lieber Tee."',
    options: ['keinen', 'nicht', 'keine', 'nichts'],
    correctIndex: 0,
    explanation:
      'To negate a noun with an indefinite/zero article ("Kaffee", masculine accusative), German uses "kein" -> "keinen Kaffee".',
  },
  {
    id: 'gram-05',
    skill: 'grammar',
    difficulty: 1,
    topic: 'Question Words',
    prompt: 'Complete the question: "___ kostet das Mineralwasser?" — "2,50 Euro."',
    options: ['Wie viel', 'Wer', 'Wann', 'Woher'],
    correctIndex: 0,
    explanation:
      '"Wie viel" asks about price or quantity ("How much does the mineral water cost?").',
  },
  {
    id: 'gram-06',
    skill: 'grammar',
    difficulty: 2,
    topic: 'Accusative Case',
    prompt: 'Choose the correct article: "Paul sucht ___ neuen Schlüssel."',
    options: ['den', 'der', 'dem', 'das'],
    correctIndex: 0,
    explanation:
      '"Suchen" takes a direct object in the accusative case. Since "Schlüssel" is masculine ("der Schlüssel"), it changes to "den".',
  },
  {
    id: 'gram-07',
    skill: 'grammar',
    difficulty: 2,
    topic: 'Modal Verbs',
    prompt: 'Complete the sentence: "Am Sonntag ___ wir nicht arbeiten."',
    options: ['müssen', 'muss', 'musst', 'müsst'],
    correctIndex: 0,
    explanation:
      'With "wir", modal verbs use the infinitive-like plural form: "wir müssen". Note that "arbeiten" goes to the end of the clause.',
  },
  {
    id: 'gram-08',
    skill: 'grammar',
    difficulty: 2,
    topic: 'Word Order (V2)',
    prompt: 'Which sentence has correct German word order?',
    options: [
      'Morgen fahre ich mit dem Zug nach Köln.',
      'Morgen ich fahre mit dem Zug nach Köln.',
      'Morgen mit dem Zug fahre ich nach Köln.',
      'Ich morgen fahre mit dem Zug nach Köln.',
    ],
    correctIndex: 0,
    explanation:
      'In German main clauses, the conjugated verb ("fahre") must stay in position 2. Putting "Morgen" first moves "ich" after the verb.',
  },
  {
    id: 'gram-09',
    skill: 'grammar',
    difficulty: 2,
    topic: 'Time Prepositions (am / im / um)',
    prompt: 'Complete: "Der Deutschkurs beginnt ___ Montag ___ 09:00 Uhr."',
    options: ['am ... um', 'im ... am', 'um ... am', 'am ... im'],
    correctIndex: 0,
    explanation:
      'Use "am" with days of the week ("am Montag") and "um" with exact clock times ("um 09:00 Uhr").',
  },
  {
    id: 'gram-10',
    skill: 'grammar',
    difficulty: 2,
    topic: 'Stem-Changing Verbs',
    prompt: 'Complete: "Lea ___ gern Kriminalromane." (lesen)',
    options: ['liest', 'lest', 'lese', 'lesen'],
    correctIndex: 0,
    explanation:
      '"Lesen" has a stem vowel change from e to ie in the 2nd and 3rd person singular: "er/sie liest".',
  },
  {
    id: 'gram-11',
    skill: 'grammar',
    difficulty: 3,
    topic: 'Separable Verbs',
    prompt: 'Choose the correct completion: "Der Supermarkt ___ samstags um 20:00 Uhr ___." (zumachen)',
    options: ['macht ... zu', 'zu ... macht', 'zumacht ... —', 'macht ... auf'],
    correctIndex: 0,
    explanation:
      'In present tense main clauses, separable verbs split: the conjugated stem ("macht") goes in position 2 and the prefix ("zu") goes to the end.',
  },
  {
    id: 'gram-12',
    skill: 'grammar',
    difficulty: 3,
    topic: 'Dative with Prepositions',
    prompt: 'Complete: "Ich fahre jeden Morgen ___ ___ Bus zur Arbeit."',
    options: ['mit dem', 'mit den', 'mit der', 'mit das'],
    correctIndex: 0,
    explanation:
      'The preposition "mit" always requires the dative case. Masculine "der Bus" becomes "dem Bus" in dative.',
  },
  {
    id: 'gram-13',
    skill: 'grammar',
    difficulty: 3,
    topic: 'Perfekt (Past Tense)',
    prompt: 'Complete the sentence in the past: "Gestern ___ wir lange im Park ___."',
    options: [
      'sind ... spazieren gegangen',
      'haben ... spazieren gegangen',
      'sind ... spazieren gehen',
      'haben ... gegangt',
    ],
    correctIndex: 0,
    explanation:
      'Verbs of movement ("gehen") form the Perfekt with "sein" ("wir sind") plus the irregular past participle "gegangen" at the end.',
  },
  {
    id: 'gram-14',
    skill: 'grammar',
    difficulty: 3,
    topic: 'Possessive Articles',
    prompt: 'Complete: "Das ist Frau Weber. ___ Auto steht vor dem Haus."',
    options: ['Ihr', 'Sein', 'Euer', 'Unser'],
    correctIndex: 0,
    explanation:
      'For a female possessor ("Frau Weber" = sie), the possessive article for a neuter noun ("das Auto") is "Ihr" ("her car").',
  },
  {
    id: 'gram-15',
    skill: 'grammar',
    difficulty: 3,
    topic: 'Polite Imperative (Sie)',
    prompt: 'How do you politely ask a stranger to speak more slowly?',
    options: [
      'Sprechen Sie bitte langsamer!',
      'Sprichst du bitte langsamer!',
      'Sie sprechen bitte langsamer!',
      'Gesprochen Sie bitte langsamer!',
    ],
    correctIndex: 0,
    explanation:
      'The formal imperative places the verb first followed by "Sie": "Sprechen Sie bitte langsamer!"',
  },

  // ==========================================
  // READING (15 questions across 4 passages)
  // ==========================================
  // Passage 1: Hausmitteilung (4 questions)
  {
    id: 'read-01',
    skill: 'reading',
    difficulty: 1,
    topic: 'Notice Details (Time)',
    passageId: 'passage-hausflur',
    prompt: 'Wann gibt es kein Wasser im Haus?',
    options: [
      'Am Donnerstagvormittag von 08:30 bis 12:00 Uhr.',
      'Am Mittwochabend ab 18:00 Uhr.',
      'Am Freitag früh um 07:00 Uhr.',
      'Die ganze Woche über.',
    ],
    correctIndex: 0,
    explanation:
      'The notice states: "am Donnerstag, dem 14. Mai, reparieren wir von 08:30 Uhr bis 12:00 Uhr die Wasserleitungen."',
  },
  {
    id: 'read-02',
    skill: 'reading',
    difficulty: 2,
    topic: 'Notice Instructions',
    passageId: 'passage-hausflur',
    prompt: 'Was sollen die Mieter schon am Mittwochabend tun?',
    options: [
      'Alte Kartons vor die Haustür stellen.',
      'Etwas Wasser für Kaffee oder zum Kochen abfüllen.',
      'Die Hausverwaltung Becker anrufen.',
      'Die blaue Tonne auf die Straße bringen.',
    ],
    correctIndex: 1,
    explanation:
      '"Bitte füllen Sie am Mittwochabend etwas Wasser für Kaffee oder zum Kochen ab" tells tenants to store water the evening before.',
  },
  {
    id: 'read-03',
    skill: 'reading',
    difficulty: 2,
    topic: 'Rules & Exceptions',
    passageId: 'passage-hausflur',
    prompt: 'Wohin soll man altes Papier und Kartons bringen?',
    options: [
      'Vor die Haustür.',
      'In die Wohnung im Erdgeschoss.',
      'In die blaue Tonne im Hof.',
      'Direkt zur Müllabfuhr auf der Straße.',
    ],
    correctIndex: 2,
    explanation:
      'The notice asks residents NOT to leave boxes by the front door, "sondern direkt in die blaue Tonne im Hof" (into the blue bin in the courtyard).',
  },
  {
    id: 'read-04',
    skill: 'reading',
    difficulty: 3,
    topic: 'Inference from Notice',
    passageId: 'passage-hausflur',
    prompt: 'Welche Aussage über den Donnerstagvormittag ist richtig?',
    options: [
      'Es gibt kaltes Wasser, aber kein warmes Wasser.',
      'Es gibt weder warmes noch kaltes Wasser.',
      'Nur im ersten Stock funktioniert das Wasser.',
      'Die Müllabfuhr holt am Donnerstag das Papier ab.',
    ],
    correctIndex: 1,
    explanation:
      '"In dieser Zeit gibt es leider kein warmes und kein kaltes Wasser" means neither hot nor cold water will be available.',
  },

  // Passage 2: E-Mail von Lukas (4 questions)
  {
    id: 'read-05',
    skill: 'reading',
    difficulty: 1,
    topic: 'Event & Location',
    passageId: 'passage-lukas-email',
    prompt: 'Warum schreibt Lukas diese E-Mail an Sara?',
    options: [
      'Er sucht eine neue Wohnung in der Schillerstraße.',
      'Er lädt Sara am Samstagabend zu sich ein.',
      'Er möchte ein Pasta-Rezept von Sara haben.',
      'Er arbeitet am Samstagabend.',
    ],
    correctIndex: 1,
    explanation:
      'Lukas invites Sara for Saturday at 19:00 to celebrate his birthday belatedly at his new apartment.',
  },
  {
    id: 'read-06',
    skill: 'reading',
    difficulty: 2,
    topic: 'Specific Requests',
    passageId: 'passage-lukas-email',
    prompt: 'Was soll Sara am Samstag vielleicht mitbringen?',
    options: [
      'Einen Salat',
      'Pasta und Tomatensoße',
      'Ein paar Getränke',
      'Musik',
    ],
    correctIndex: 2,
    explanation:
      'Lukas cooks pasta and salad himself, and asks Sara: "vielleicht hast du Lust, ein paar Getränke mitzunehmen?" Jonas\'s girlfriend brings music.',
  },
  {
    id: 'read-07',
    skill: 'reading',
    difficulty: 2,
    topic: 'Deadlines in Messages',
    passageId: 'passage-lukas-email',
    prompt: 'Bis wann möchte Lukas eine Antwort von Sara?',
    options: [
      'Bis Samstagmorgen',
      'Bis Donnerstagabend',
      'Bis Freitagmittag',
      'Bis Sonntag',
    ],
    correctIndex: 1,
    explanation:
      '"Sag mir bitte bis Donnerstagabend kurz Bescheid, ob du Zeit hast."',
  },
  {
    id: 'read-08',
    skill: 'reading',
    difficulty: 3,
    topic: 'Reading Comprehension (Detail)',
    passageId: 'passage-lukas-email',
    prompt: 'Wer kommt außer Sara noch zu Lukas?',
    options: [
      'Nur sein Bruder Jonas',
      'Sein Bruder Jonas und dessen Freundin',
      'Saras Bruder und seine Freundin',
      'Niemand anderes',
    ],
    correctIndex: 1,
    explanation:
      '"Mein Bruder Jonas kommt auch, und seine Freundin bringt Musik mit." Both Jonas and his girlfriend are coming.',
  },

  // Passage 3: Stadtbibliothek Mitte (4 questions)
  {
    id: 'read-09',
    skill: 'reading',
    difficulty: 1,
    topic: 'Opening Hours',
    passageId: 'passage-bibliothek',
    prompt: 'Wann ist die Stadtbibliothek Mitte geöffnet?',
    options: [
      'Am Montag um 11:00 Uhr',
      'Am Samstag um 12:30 Uhr',
      'Am Sonntag um 13:00 Uhr',
      'Am Freitag um 19:00 Uhr',
    ],
    correctIndex: 1,
    explanation:
      'Saturday hours are 10:00 – 14:00. Sunday and Monday are closed, and Friday closes at 18:30.',
  },
  {
    id: 'read-10',
    skill: 'reading',
    difficulty: 2,
    topic: 'Fees & Eligibility',
    passageId: 'passage-bibliothek',
    prompt: 'Für wen ist der Bibliotheksausweis kostenlos?',
    options: [
      'Für alle Erwachsenen über 25 Jahre',
      'Für Kinder, Schülerinnen/Schüler und Studierende bis 25 Jahre',
      'Nur am Samstag für neue Besucher',
      'Für niemanden; er kostet immer 18 Euro',
    ],
    correctIndex: 1,
    explanation:
      '"Für Kinder, Schülerinnen und Schüler sowie Studierende bis 25 Jahre ist die Anmeldung kostenlos."',
  },
  {
    id: 'read-11',
    skill: 'reading',
    difficulty: 3,
    topic: 'Conditions & Exceptions',
    passageId: 'passage-bibliothek',
    prompt: 'Wann können Sie ein ausgeliehenes Buch NICHT online verlängern?',
    options: [
      'Wenn Sie mehr als fünf Bücher zu Hause haben.',
      'Wenn Sie einen kostenlosen Ausweis haben.',
      'Wenn eine andere Person das Buch reserviert hat.',
      'Wenn es ein Hörbuch statt eines Buches ist.',
    ],
    correctIndex: 2,
    explanation:
      '"Sie können Bücher auch online verlängern — aber nur, wenn niemand anderes das Buch reserviert hat."',
  },
  {
    id: 'read-12',
    skill: 'reading',
    difficulty: 2,
    topic: 'Borrowing Limits',
    passageId: 'passage-bibliothek',
    prompt: 'Wie lange darf man Medien normal ausleihen?',
    options: [
      'Für eine Woche',
      'Für zwei Wochen',
      'Für vier Wochen',
      'Für ein ganzes Jahr',
    ],
    correctIndex: 2,
    explanation:
      'The text states you can borrow up to 15 items "für vier Wochen" (for four weeks).',
  },

  // Passage 4: Sprachcafé (3 questions)
  {
    id: 'read-13',
    skill: 'reading',
    difficulty: 1,
    topic: 'Event Schedule & Place',
    passageId: 'passage-sprachcafe',
    prompt: 'Wo findet das Sprachcafé statt?',
    options: [
      'In der Apotheke',
      'Im Café „Treffpunkt“ in der Bahnhofstraße 4',
      'In der Stadtbibliothek',
      'Nur telefonisch',
    ],
    correctIndex: 1,
    explanation:
      'It meets "im Café „Treffpunkt“ in der Bahnhofstraße 4 (gleich neben der Apotheke)".',
  },
  {
    id: 'read-14',
    skill: 'reading',
    difficulty: 2,
    topic: 'Participation Rules',
    passageId: 'passage-sprachcafe',
    prompt: 'Was müssen Besucher vor dem Treffen tun?',
    options: [
      'Sich vorher online anmelden.',
      '1,50 Euro Eintritt bezahlen.',
      'Schon mindestens Niveau B2 haben.',
      'Nichts — eine Anmeldung ist nicht nötig.',
    ],
    correctIndex: 3,
    explanation:
      '"Die Teilnahme ist gratis und Sie müssen sich nicht vorher anmelden." Only drinks cost 1.50 €, and levels A1–B2 are welcome.',
  },
  {
    id: 'read-15',
    skill: 'reading',
    difficulty: 3,
    topic: 'Contact Hours',
    passageId: 'passage-sprachcafe',
    prompt: 'Wann kann man im Sprachcafé anrufen, wenn man Fragen hat?',
    options: [
      'Jeden Mittwoch von 17:30 bis 19:00 Uhr',
      'Dienstags zwischen 14:00 und 16:00 Uhr',
      'Täglich rund um die Uhr',
      'Am Samstagvormittag',
    ],
    correctIndex: 1,
    explanation:
      'The poster specifies phone availability: "rufen Sie dienstags zwischen 14:00 und 16:00 Uhr unter 030 / 445566 an."',
  },
];
