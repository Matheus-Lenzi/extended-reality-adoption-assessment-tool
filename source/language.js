// Two languages, one set of forms and pages. German was asked for by the research team, and a test run
// with a weak English speaker showed what it buys: it removes the vocabulary that makes a respondent
// feel slow and start guessing. It does not fix a question that asks two things at once.
//
// Questions carry their German on the item itself (textDe). Everything else looks up its English source
// string here, gettext style, so there is one catalogue and no second copy of the page builders.
const languages = ['en', 'de'];

function pageLanguage(value) {
  const asked = textValue(value).slice(0, 2).toLowerCase();
  return languages.includes(asked) ? asked : 'en';
}

function otherLanguage(language) {
  return pageLanguage(language) === 'de' ? 'en' : 'de';
}

// The name of a language in its own language, for the switch, so a German speaker recognises it.
const languageNames = { en: 'English', de: 'Deutsch' };

const germanText = {
  // Form chrome
  'In your own words': 'In Ihren eigenen Worten',
  'Anything else you want to tell us about this task? (optional)': 'Möchten Sie uns noch etwas zu dieser Aufgabe sagen? (optional)',
  'Anything the questions above did not let you say. This is shown in the report exactly as you write it, without your name.':
    'Alles, was die Fragen oben nicht abgedeckt haben. Es erscheint im Bericht genau so, wie Sie es schreiben, ohne Ihren Namen.',
  'Your name (optional)': 'Ihr Name (optional)',
  'Yes': 'Ja',
  'No': 'Nein',
  'Maybe': 'Vielleicht',
  'Unsure': 'Weiß nicht',
  "I don't know": 'Weiß ich nicht',
  'Voluntary': 'Freiwillig',
  'Mandatory': 'Verpflichtend',
  '18-29': '18-29',
  '30-49': '30-49',
  '50+': '50+',
  // Section headings on the Adopter form
  'Danger': 'Gefährdung',
  'Immersion': 'Immersion',
  'Verification': 'Überprüfung',
  'Expertise': 'Fachwissen',
  'Collaboration': 'Zusammenarbeit',
  'Site conditions': 'Bedingungen vor Ort',
  'Your concerns': 'Ihre Bedenken',
  'About you': 'Über Sie',
  'Rate how relevant, 0–10.': 'Bewerten Sie die Relevanz, 0 bis 10.',
  'Your own direct experience/concerns, not a prediction about others.':
    'Ihre eigene Erfahrung und Ihre eigenen Bedenken, keine Einschätzung über andere.',
  // The context box
  'Company': 'Unternehmen',
  'Task': 'Aufgabe',
  'What happens': 'Worum es geht',
  'Set-up': 'Aufstellung',
  'Device': 'Gerät',
  'Software': 'Software',
  // Answer options. The stored value stays English, mapped back by position in the item's own list.
  'Us': 'Wir',
  'A different organisation': 'Eine andere Organisation',
  'No one established yet': 'Noch niemand',
  'Cost savings': 'Kosteneinsparung',
  'Time savings': 'Zeitersparnis',
  'Quality improvement or error reduction': 'Bessere Qualität oder weniger Fehler',
  'Competitive/strategic advantage': 'Wettbewerbsvorteil oder strategischer Vorteil',
  'Employer branding or talent attraction': 'Arbeitgebermarke oder Gewinnung von Fachkräften',
  'Not yet/partially tested': 'Noch nicht oder nur teilweise geprüft',
  'Not yet discussed': 'Noch nicht besprochen',
  // Note fields that sit under a question
  'Note which': 'Welche',
  'What is tracked, and are workers notified?': 'Was wird erfasst, und werden die Beschäftigten informiert?',
  'Contact': 'Kontakt',
  'Describe': 'Beschreibung',
  'Example': 'Beispiel',
  ' (optional)': ' (optional)',
  // Remaining section headings
  'Task context': 'Zur Aufgabe',
  'Current reliance': 'Wer bisher gefragt wird',
  'Evidence pool': 'Unsere Bewertung',
  'Technology readiness per task dimension': 'Reifegrad der Technik je Anforderung',
  'Vendor track record': 'Erfahrung des Anbieters',
  'Expected benefits': 'Erwarteter Nutzen',
  'Social and organisational culture': 'Soziales Umfeld und Unternehmenskultur',
  'Leadership and measurement': 'Führung und Messbarkeit',
  'Compliance': 'Rechtliche Vorgaben',
  'Existing infrastructure': 'Vorhandene Infrastruktur',
  'Integration feasibility': 'Machbarkeit der Anbindung',
  'Expected resistance': 'Erwartete Vorbehalte',
  'Partners and market': 'Partner und Markt',
  'Ecosystem strategy': 'Strategie im Umfeld',
  // Section notes
  'Your holistic 0\u201310 judgement, informed by the evidence pool above, not computed from it.':
    'Ihre Gesamteinschätzung von 0 bis 10, gestützt auf die Bewertung oben, aber nicht daraus berechnet.',
  'Your prediction of how the workforce will react, not a survey of them.':
    'Ihre Einschätzung, wie die Belegschaft reagieren wird, keine Befragung der Belegschaft.',
  'Two of these come in a leader version and a follower version. Answer the one that matches your position, and leave the other blank.':
    'Zwei davon gibt es in einer Fassung für den Führenden und einer für den Mitziehenden. Beantworten Sie die, die auf Sie zutrifft, und lassen Sie die andere frei.',
  'Where we evaluated the hardware and/or software, the evaluation is shown and the answer is pre-filled from it. Change it if your judgment differs.':
    'Wo wir die Hardware oder Software bewertet haben, wird die Bewertung angezeigt und die Antwort daraus vorbelegt. Ändern Sie sie, wenn Sie es anders einschätzen.',
  // Report page
  'Task & Technology': 'Aufgabe und Technik',
  'Organisation': 'Organisation',
  'People': 'Mensch und Akzeptanz',
  'Partners & Market': 'Partner und Markt',
  'Does the task need XR, and can the equipment deliver it?': 'Braucht die Aufgabe XR, und kann die Technik das leisten?',
  'Is the company set up to make it work?': 'Ist das Unternehmen dafür aufgestellt?',
  'What do the people who would use it think?': 'Was halten diejenigen davon, die damit arbeiten würden?',
  'What depends on other companies?': 'Was hängt von anderen Unternehmen ab?',
  'Answers': 'Antworten',
  'Results': 'Ergebnisse',
  'Adopters': 'Anwender',
  'Developers': 'Entwickler',
  'Integrators': 'Integratoren',
  'Raised': 'Auffällig',
  'Cleared': 'Unauffällig',
  'Skipped': 'Nicht geprüft',
  'Comments': 'Freitextantworten',
  'Summary': 'Zusammenfassung',
  'Legend': 'Legende',
  'Blockers': 'Blocker',
  'Warnings': 'Warnungen',
  'Notes': 'Hinweise',
  'fix this first': 'zuerst beheben',
  'check this soon': 'bald prüfen',
  'read this next': 'als Nächstes lesen',
  'found something': 'etwas gefunden',
  'found nothing': 'nichts gefunden',
  'could not run': 'konnte nicht durchgeführt werden',
  'Waiting for an answer': 'Wartet auf eine Antwort',
  'No majority answer': 'Keine Mehrheit',
  'Does not apply here': 'Trifft hier nicht zu',
  'No rule exists yet': 'Dafür gibt es noch keine Regel',
  'Could not check': 'Konnte nicht geprüft werden',
  'Nothing to look at here.': 'Hier gibt es nichts zu sehen.',
  'What people wrote in their own words.': 'Was die Beteiligten in eigenen Worten geschrieben haben.',
  'In their own words': 'In eigenen Worten',
  'Worries': 'Sorgen',
  'Readiness': 'Bereitschaft',
  'Privacy': 'Datenschutz',
  'Fear for their job': 'Angst um den Arbeitsplatz',
  'Sharing devices': 'Gemeinsam genutzte Geräte',
  'Using it feels': 'Empfundene Nutzung',
  'Openness to new tech': 'Offenheit für neue Technik',
  'Experience with new tech': 'Erfahrung mit neuer Technik',
  'Summarise in plain English': 'Zusammenfassung in einfacher Sprache',
  'Written by AI from the points below.': 'Von einer KI aus den Punkten unten geschrieben.',
  'One square per person who answered': 'Ein Kästchen je Person, die geantwortet hat',
  'Report': 'Bericht',
  'Deployments': 'Vorhaben',
  'New deployment': 'Neues Vorhaben',
  // The eight fit dimensions, used in the chart and inside flag texts
  'Danger': 'Gefahr',
  'Distraction': 'Ablenkung',
  'Auditory': 'Auditiv',
  'Visual': 'Visuell',
  'Haptic': 'Haptik',
  'Actions': 'Handlungen',
  'Knowledge': 'Wissen',
  'Expertise': 'Fachwissen',
  'required': 'nötig',
  'delivered': 'geliefert',
  'overall': 'insgesamt',
  // Topics of checks that could not run
  'motion sickness and fatigue risk': 'Übelkeit und Ermüdung',
  'technology skills against the training plan': 'Technikkenntnisse gegenüber dem Schulungsplan',
  'openness and experience together': 'Offenheit und Erfahrung zusammen',
  "management's view against what the adopters report": 'die Sicht der Führung gegenüber dem, was die Anwender berichten',
  'the position to take with partners when leading': 'die Haltung gegenüber Partnern in der führenden Rolle',
  'the position to take with partners when following': 'die Haltung gegenüber Partnern in der Rolle eines Nachfolgers',
  'Our company supplies the XR technology': 'Unser Unternehmen liefert die XR-Technik',
  'An external supplier provides the XR technology.': 'Ein externer Anbieter liefert die XR-Technik.',
  'Our company sets it up.': 'Unser Unternehmen richtet sie ein.',
  'The same supplier sets it up.': 'Derselbe Anbieter richtet sie ein.',
  'Another company sets it up.': 'Ein anderes Unternehmen richtet sie ein.',
  'Summarise in plain English': 'Zusammenfassung in einfacher Sprache',
  'Written once and kept, so everyone sees the same summary.': 'Einmal geschrieben und gespeichert, damit alle dieselbe Zusammenfassung sehen.',
  'Written by AI from the points below.': 'Von einer KI aus den Punkten unten geschrieben.',
  'New answers have arrived since this summary was written.': 'Seit dieser Zusammenfassung sind neue Antworten eingegangen.',
  'Rewrite?': 'Neu schreiben?',
  'A plain-English summary can be written once all three forms have an answer. Waiting for: ':
    'Eine Zusammenfassung in einfacher Sprache kann geschrieben werden, sobald alle drei Formulare eine Antwort haben. Es fehlt noch: ',
  'You can still close these': 'Diese können Sie noch klären',
  'Nothing is missing on your side': 'Auf Ihrer Seite fehlt nichts',
  'out of 10': 'von 10',
  'How well the task and the equipment fit each other.': 'Wie gut Aufgabe und Technik zueinander passen.',
  'required, what the task asks for': 'nötig, was die Aufgabe verlangt',
  'delivered, what the equipment gives': 'vorhanden, was die Technik bietet',
  'overall, the average of the eight': 'insgesamt, der Durchschnitt über alle acht Dimensionen',
  'The number on the right is the fit between required and delivered.': 'Die Zahl rechts zeigt die Passung zwischen nötig und geliefert.',
  'The fit score needs answers from both Adopters and Developers.': 'Der Passungswert braucht Antworten von Anwendern und Entwicklern.',
  'acts': 'handelt',
  'Adopter': 'Anwender',
  'Developer': 'Entwickler',
  'Integrator': 'Integrator',
  'Adopters with Integrator': 'Anwender mit Integrator',
  'Integrators with Developer': 'Integratoren mit Entwickler',
  'Points raised for this task, most urgent first within each group:': 'Auffällige Punkte zu dieser Aufgabe, je Gruppe das Dringendste zuerst:',
  'What people wrote in their own words. Treat these as facts too:': 'Was die Beteiligten in eigenen Worten geschrieben haben. Behandeln Sie das ebenfalls als Tatsachen:',
  'Your deployments · newest first': 'Ihre Vorhaben · neueste zuerst',
  'No deployments yet. Start one with New deployment.': 'Noch keine Vorhaben. Legen Sie eines mit Neues Vorhaben an.',
  'Each deployment has three links, one each for Adopters, Developers and Integrators. Copy one and send it to the people who should answer. Several people can answer each.':
    'Jedes Vorhaben hat drei Links, je einen für Anwender, Entwickler und Integratoren. Kopieren Sie einen und senden Sie ihn an die Personen, die antworten sollen. Mehrere Personen können denselben Link beantworten.',
  'Each role has an EN and a DE link. Send the one in the language that person reads.':
    'Jede Rolle hat einen EN- und einen DE-Link. Senden Sie den in der Sprache, die die Person liest.',
  'created': 'erstellt',
  'Task': 'Aufgabe',
  // The block of checks that could not run, which was left in English entirely
  'Checks that could not be run': 'Prüfungen, die nicht durchgeführt werden konnten',
  'Three parts of the model are still being researched: a stage comparing the four parts, a motion-sickness score, and the partner-strategy label. They are missing from the research, not from your answers.':
    'An drei Teilen des Modells wird noch geforscht: eine Stufe, die die vier Teile vergleicht, ein Wert zur Übelkeit und das Strategielabel für Partner. Diese fehlen in der Forschung, nicht in Ihren Antworten.',
  'Waiting on': 'Wartet auf',
  'and': 'und',
  'XR report': 'XR-Bericht',
  'Copy the link for': 'Link kopieren für',
  'in': 'auf',
  // The intro every respondent reads, including what happens to their answers
  'You are setting up one task for your team to assess. The people who do the task, build the technology and install it each answer their own form.':
    'Sie legen eine Aufgabe an, die Ihr Team bewerten soll. Die Personen, die die Aufgabe ausführen, die Technik entwickeln und sie einrichten, füllen jeweils ihr eigenes Formular aus.',
  'is checking whether XR suits one deployment.': 'prüft, ob XR für ein Vorhaben geeignet ist.',
  'XR means smart glasses or a headset that can show instructions and pictures while you work.':
    'XR bedeutet eine Datenbrille oder ein Headset, das Ihnen während der Arbeit Anleitungen und Bilder einblenden kann.',
  'Your answers go into a report their team reads. Numbers are shown only as totals, never on their own and never with your name.':
    'Ihre Antworten fließen in einen Bericht ein, den das Team liest. Zahlen erscheinen nur als Summen, nie einzeln und nie mit Ihrem Namen.',
  'Anything you type in a text box is shown in full, without your name.':
    'Was Sie in ein Textfeld schreiben, erscheint vollständig, aber ohne Ihren Namen.',
  'Your answers go into a report their team reads.': 'Ihre Antworten fließen in einen Bericht ein, den das Team liest.',
  // The two question hints
  'Weigh down if Adopter flagged S4 (work clothes) or long-duration use':
    'Niedriger bewerten, wenn die Anwender Schutzkleidung (S4) oder langes Tragen angegeben haben',
  'Adjust down if Adopter flagged dusty/wet/low-light site conditions (S1-S3)':
    'Niedriger bewerten, wenn die Anwender Staub, Nässe oder schlechtes Licht angegeben haben (S1 bis S3)',
  'Also consider (sub-notes, not separately scored): does this task benefit from extended visual support (additional enriching info), a selective/filtered view, better coordination/structuring of complex information, or visualization of spatial relationships/positioning?':
    'Denken Sie dabei auch an Folgendes, das nicht gesondert bewertet wird: Hilft es bei dieser Aufgabe, zusätzliche Hinweise einzublenden, nur das Wichtige zu zeigen, komplexe Informationen besser zu ordnen, oder räumliche Lagen und Positionen darzustellen?',
  // Words a setter said nobody in a workshop uses (German run, 22 Oct)
  'Rate how relevant, 0\u201310.': 'Wie wichtig ist das? 0 bis 10.',
  'Immersion': 'Sinneseindruck',
  'Verification': 'Nachvollziehen',
  'Site conditions': 'Bedingungen in der Halle',
  'Who does what': 'Wer macht was',
  'Read the list to check it.': 'Lesen Sie die Liste zur Kontrolle.',
  'Write it again': 'Neu schreiben',
  'The name on the right of each line is who should act on it.': 'Der Name rechts neben jeder Zeile sagt, wer sich darum kümmern soll.',
  'Some parts of the model are still being researched, so these checks have no rule yet. They are missing from the research, not from your answers.':
    'An einigen Teilen des Modells wird noch geforscht, daher gibt es für diese Prüfungen noch keine Regel. Sie fehlen in der Forschung, nicht in Ihren Antworten.',
  'The task': 'Die Aufgabe',
  'Who sets it up in your operations (installation, integration, training)?': 'Wer richtet sie in Ihrem Betrieb ein (Installation, Anbindung, Schulung)?',
  'Our company': 'Unser Unternehmen',
  'Same supplier': 'Derselbe Anbieter',
  'Another company': 'Ein anderes Unternehmen',
  'What happens in this task? (a few sentences, so everyone answering knows which task this is)':
    'Worum geht es bei dieser Aufgabe? (ein paar Sätze, damit alle Befragten wissen, um welche Aufgabe es geht)',
  'Weakest-evidenced rating -- treat as expert judgement, not benchmark-verified':
    'Am schwächsten belegte Bewertung. Behandeln Sie sie als fachliche Einschätzung, nicht als geprüften Messwert'
};

function sayText(text, language) {
  const source = textValue(text);
  if (pageLanguage(language) !== 'de') return source;
  return germanText[source] || source;
}

// A respondent sees German options but the rules test English values ("Yes", "A different organisation").
// Reverse by position in the item's own option list, which is exact: the shown list is built from it.
function sourceOption(item, shown, language) {
  const given = textValue(shown);
  if (pageLanguage(language) !== 'de' || !Array.isArray(item?.options) || given === '') return given;
  const index = item.options.map((option) => sayText(option, 'de')).indexOf(given);
  return index === -1 ? given : item.options[index];
}

// German writes 2,3 where English writes 2.3. A German engineer reads "2.3" as a section number.
function decimalText(value, language) {
  const shown = Number(value).toFixed(1);
  return pageLanguage(language) === 'de' ? shown.replace('.', ',') : shown;
}

// "1 von 5 Anwendern fürchten" is wrong: with "1 von n" the verb must be singular. The headline holds
// both forms as "singular|plural" and the count decides.
function countedText(headline, count) {
  return textValue(headline).replace(/([A-Za-zÄÖÜäöüß]+)\|([A-Za-zÄÖÜäöüß]+)/g, (whole, one, many) => (Number(count) === 1 ? one : many));
}
