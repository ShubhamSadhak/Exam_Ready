import type { Passage } from '../../shared/types.ts';

export const PASSAGES: Passage[] = [
  {
    id: 'passage-hausflur',
    title: 'Hausmitteilung: Wasser & Müll',
    context: 'Aushang im Treppenhaus (Notice in apartment hallway)',
    body: [
      'Liebe Mieterinnen und Mieter,',
      'am Donnerstag, dem 14. Mai, reparieren wir von 08:30 Uhr bis 12:00 Uhr die Wasserleitungen im Haus. In dieser Zeit gibt es leider kein warmes und kein kaltes Wasser. Bitte füllen Sie am Mittwochabend etwas Wasser für Kaffee oder zum Kochen ab.',
      'Noch eine Bitte: Stellen Sie alte Kartons und Papier nicht vor die Haustür, sondern direkt in die blaue Tonne im Hof. Die Müllabfuhr kommt jeden Freitag früh um 07:00 Uhr.',
      'Vielen Dank für Ihr Verständnis!',
      'Ihre Hausverwaltung Becker',
    ].join('\n\n'),
  },
  {
    id: 'passage-lukas-email',
    title: 'E-Mail von Lukas',
    context: 'Persönliche Nachricht (Personal email to a friend)',
    body: [
      'Hallo Sara,',
      'wie geht es dir? Am Samstag habe ich endlich wieder frei und möchte meinen Geburtstag ein bisschen nachfeiern. Kommst du am Samstagabend um 19:00 Uhr zu mir? Meine neue Wohnung ist in der Schillerstraße 18, im dritten Stock links.',
      'Ich koche Pasta mit Tomatensoße und mache einen Salat. Du musst nichts zu essen mitbringen, aber vielleicht hast du Lust, ein paar Getränke mitzunehmen? Mein Bruder Jonas kommt auch, und seine Freundin bringt Musik mit.',
      'Sag mir bitte bis Donnerstagabend kurz Bescheid, ob du Zeit hast.',
      'Liebe Grüße, Lukas',
    ].join('\n\n'),
  },
  {
    id: 'passage-bibliothek',
    title: 'Stadtbibliothek Mitte — Informationen',
    context: 'Webseite einer Bibliothek (Public library info page)',
    body: [
      'Öffnungszeiten:',
      'Dienstag bis Freitag: 10:00 – 18:30 Uhr',
      'Samstag: 10:00 – 14:00 Uhr',
      'Sonntag und Montag: geschlossen',
      'Mit einem Bibliotheksausweis können Sie bis zu 15 Bücher, Filme oder Hörbücher für vier Wochen ausleihen. Der Ausweis kostet für Erwachsene 18 Euro im Jahr. Für Kinder, Schülerinnen und Schüler sowie Studierende bis 25 Jahre ist die Anmeldung kostenlos.',
      'Sie können Bücher auch online verlängern — aber nur, wenn niemand anderes das Buch reserviert hat. Im ersten Stock gibt es ruhige Arbeitsplätze und kostenloses WLAN.',
    ].join('\n\n'),
  },
  {
    id: 'passage-sprachcafe',
    title: 'Sprachcafé im Nachbarschaftshaus',
    context: 'Plakat am Schwarzen Brett (Community bulletin board poster)',
    body: [
      'Möchten Sie Deutsch sprechen und neue Leute kennenlernen?',
      'Jeden Mittwochabend von 17:30 bis 19:00 Uhr treffen wir uns im Café „Treffpunkt“ in der Bahnhofstraße 4 (gleich neben der Apotheke). Alle Niveaus von A1 bis B2 sind willkommen!',
      'Die Teilnahme ist gratis und Sie müssen sich nicht vorher anmelden. Tee, Kaffee und Wasser kosten 1,50 Euro. Bei gutem Wetter sitzen wir im kleinen Garten hinter dem Haus.',
      'Fragen? Schreiben Sie an: treffpunkt@kultur-stadt.de oder rufen Sie dienstags zwischen 14:00 und 16:00 Uhr unter 030 / 445566 an.',
    ].join('\n\n'),
  },
];
