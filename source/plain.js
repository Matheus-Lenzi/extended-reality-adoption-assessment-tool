// A plain-English headline for every check, shown above the researcher's own wording.
// Ours, not the workbook's: written so a reader outside the research can act on a finding. Not yet confirmed.
// The runtime placeholders are filled from the flag text itself, so counts stay exactly as computed.
const headlines = {
  "RB-A1": "[Dimension] is needed for this task, but the equipment cannot deliver it yet",
  "RB-B1": "The audio rating is expert judgement. No published test backs it up",
  "RB-B2": "The touch-feedback rating is expert judgement. No published test backs it up",
  "RB-C1": "The fit score does not yet weigh complex tasks differently. Treat it as provisional",
  "RB-D1": "Motion sickness and fatigue risk for long sessions",
  "RB-D2": "Poor comfort for long wear. People may refuse the device",
  "RB-E1": "People rely on knowledge that is written down nowhere. Capture it first",
  "RB-E2": "The documents exist but are hard to find. Fix that before building content",
  "RB-E3": "Complex task plus heavy content work. Expect content to be the bottleneck",
  "RB-E4": "People break off to look things up. An overlay on existing files may be enough",
  "RB-F1": "The task needs realistic behaviour, but touch feedback is weak",
  "RB-F2": "High stakes and high realism. A low-fidelity version could do more harm than none",
  "RB-G1": "This is training that has to be assessed. Check the software can score and certify",
  "RB-H1": "Teamwork plus remote working. This points to guidance from a remote expert, not one person working alone",
  "RB-I1": "Dust or weather on site. You need a sealed, rugged device, which narrows the choice",
  "RB-I2": "Very bright or very dark site. Screen readability is a hardware limit",
  "RB-I3": "Noisy place and audio matters. Make sure a visual or touch alternative exists",
  "RB-I4": "Gloves plus hands-free work. Gestures may be degraded. Consider voice or buttons",
  "RB2-01": "Cost saving is the top expected benefit, but nothing measures it yet",
  "RB2-02": "Benefits are expected, but leadership is not committed to seeing it through",
  "RB2-03": "Employer branding is the top strategic benefit, but internal acceptance is low",
  "RB2-04": "Both staff support and company readiness are low. Fix this before piloting",
  "RB2-05": "Staff support is low, but leadership is committed. That is your main lever",
  "RB2-06": "Safety and ergonomic rules cannot be ensured. This blocks the pilot",
  "RB2-07": "There is no existing system to connect to. Budget for building it, not just licences",
  "RB2-08": "The systems are not documented for integration. Allow time to work them out",
  "RB2-09": "Interface feasibility is not confirmed. Check with IT before you commit",
  "RB2-10": "Network capacity is unconfirmed. Agree which side still has to test it",
  "RB3-01": "No trial and no support plan. That combination invites resistance",
  "RB3-02": "No support in place, and no plan for what support would be needed",
  "RB3-03": "Staff are unfamiliar with the technology, and there is no training plan",
  "RB3-04": "Competitor adoption is not known. A quick scan would close this",
  "RB3-05": "Little help available inside or outside. Internal skills carry the risk",
  "RB3-06": "N of M adopters fear for their jobs. Exposure alone will not fix this",
  "RB3-07": "N of M have privacy worries, and the device really can track. You need a policy",
  "RB3-08": "N of M have privacy worries, but the device cannot track. Explain what it does",
  "RB3-09": "N of M adopters worry about sharing devices. Agree a cleaning routine",
  "RB3-10": "N of M see using this as mandatory, not their choice. That affects acceptance",
  "RB3-11": "Low openness together with low experience would need a gentler introduction",
  "RB3-12": "Management may expect less resistance than the adopters actually report",
  "RB3-13": "Management expects resistance, but no worker reported privacy or job fears",
  "RB4-01": "No live installations and no reference customer. Treat this supplier as higher risk",
  "RB4-02": "A reference customer was offered. Contact them rather than take it on trust",
  "RB4-03": "IT and security are not helping design this. They could block it outright",
  "RB4-04": "Success depends on another organisation being ready too. Check that before timing",
  "RB4-05": "Market movement is not known. A quick scan would close this",
  "RB4-06": "None of the three signs of leading capability hold. Plan on a follower role",
  "RB4-07": "Some leading capability, but the customer has not discussed it yet",
  "RB4-08": "The customer already turns to another supplier for this. Start as a follower",
  "RB4-09": "The customer treats us as incumbent, but no contractual authority is agreed yet",
  "RB4-10": "The customer agreed we would coordinate, but the contract does not back it up",
  "RB4-11": "Leading, but unwilling to share gains. Points toward a dominator position",
  "RB4-12": "Following, but unwilling to share data. Points toward a protector position"
};

const skippedTopics = {
  'RB-D1': 'motion sickness and fatigue risk',
  'RB3-03': 'technology skills against the training plan',
  'RB3-11': 'openness and experience together',
  'RB3-12': 'management\'s view against what the adopters report',
  'RB4-11': 'the position to take with partners when leading',
  'RB4-12': 'the position to take with partners when following'
};

function skippedTopic(ruleId, language) {
  return sayText(skippedTopics[ruleId] || '', language);
}

const headlinesDe = {
  "RB-A1": "[Dimension] wird für diese Aufgabe gebraucht, aber die Technik kann das noch nicht leisten",
  "RB-B1": "Die Bewertung des auditiven Kanals ist eine fachliche Einschätzung. Es gibt keinen veröffentlichten Test dazu",
  "RB-B2": "Die Bewertung der haptischen Rückmeldung ist eine fachliche Einschätzung. Es gibt keinen veröffentlichten Test dazu",
  "RB-C1": "Der Passungswert gewichtet komplexe Aufgaben noch nicht gesondert. Betrachten Sie ihn als vorläufig",
  "RB-D1": "Gefahr von Übelkeit und Ermüdung bei langen Einsätzen",
  "RB-D2": "Geringer Tragekomfort über lange Zeit. Die Beschäftigten könnten das Gerät ablehnen",
  "RB-E1": "Die Beschäftigten stützen sich auf Wissen, das nirgends aufgeschrieben ist. Halten Sie es zuerst fest",
  "RB-E2": "Die Unterlagen gibt es, sie sind aber schwer zu finden. Lösen Sie das, bevor Sie Inhalte bauen",
  "RB-E3": "Komplexe Aufgabe und viel Inhaltsarbeit. Rechnen Sie damit, dass der Inhalt zum Engpass wird",
  "RB-E4": "Die Beschäftigten unterbrechen die Arbeit, um etwas nachzusehen. Eine Einblendung aus vorhandenen Dateien könnte genügen",
  "RB-F1": "Die Aufgabe braucht realistisches Verhalten, aber die haptische Rückmeldung ist schwach",
  "RB-F2": "Hoher Einsatz und hohe Realitätsnähe. Eine ungenaue Umsetzung könnte mehr schaden als nützen",
  "RB-G1": "Hier wird geschult und muss geprüft werden. Prüfen Sie, ob die Software bewerten und bescheinigen kann",
  "RB-H1": "Zusammenarbeit und ortsunabhängiges Arbeiten. Das spricht für Anleitung durch einen Fachmann aus der Ferne, nicht für eine Person allein",
  "RB-I1": "Staub oder Wetter vor Ort. Sie brauchen ein dichtes, robustes Gerät, was die Auswahl einschränkt",
  "RB-I2": "Sehr heller oder sehr dunkler Einsatzort. Die Ablesbarkeit des Bildschirms ist eine Grenze der Hardware",
  "RB-I3": "Laute Umgebung und der Ton ist wichtig. Sorgen Sie für eine sichtbare oder fühlbare Alternative",
  "RB-I4": "Handschuhe und freihändiges Arbeiten. Die Gestensteuerung ist womöglich eingeschränkt. Denken Sie an Sprache oder Tasten",
  "RB2-01": "Kosteneinsparung ist der wichtigste erwartete Nutzen, aber nichts misst sie bisher",
  "RB2-02": "Nutzen wird erwartet, aber die Führung steht nicht dafür ein, ihn konsequent umzusetzen",
  "RB2-03": "Die Arbeitgebermarke ist der wichtigste strategische Nutzen, aber die Akzeptanz im Haus ist gering",
  "RB2-04": "Sowohl der Rückhalt in der Belegschaft als auch die Reife des Unternehmens sind gering. Lösen Sie das vor dem Pilotprojekt",
  "RB2-05": "Der Rückhalt in der Belegschaft ist gering, aber die Führung steht dahinter. Das ist Ihr wichtigster Hebel",
  "RB2-06": "Arbeitssicherheit und Ergonomie können nicht sichergestellt werden. Das blockiert das Pilotprojekt",
  "RB2-07": "Es gibt kein vorhandenes System zum Anschließen. Planen Sie Geld für den Aufbau ein, nicht nur für Lizenzen",
  "RB2-08": "Die Systeme sind für eine Anbindung nicht dokumentiert. Planen Sie Zeit ein, das zu klären",
  "RB2-09": "Die Machbarkeit der Schnittstellen ist nicht bestätigt. Klären Sie das mit der IT, bevor Sie sich festlegen",
  "RB2-10": "Die Netzkapazität ist nicht bestätigt. Einigen Sie sich, welche Seite das noch prüft",
  "RB3-01": "Keine Testmöglichkeit und kein Unterstützungsplan. Diese Kombination lädt zu Widerstand ein",
  "RB3-02": "Keine Unterstützung vorhanden und kein Plan, welche Unterstützung nötig wäre",
  "RB3-03": "Die Belegschaft kennt die Technik nicht, und es gibt keinen Schulungsplan",
  "RB3-04": "Ob Wettbewerber das schon einsetzen, ist nicht bekannt. Eine kurze Marktrecherche würde das klären",
  "RB3-05": "Weder im eigenen Haus noch bei externen Dienstleistern steht nennenswerte Unterstützung zur Verfügung. Das Projektrisiko hängt an den eigenen Fachkenntnissen",
  "RB3-06": "N von M Anwendern hat|haben Angst um den Arbeitsplatz. Bloßes Vorführen reicht dafür nicht",
  "RB3-07": "N von M hat|haben Datenschutzbedenken, und das Gerät erfasst tatsächlich Hand- und Kopfbewegungen. Dafür brauchen Sie eine Regelung",
  "RB3-08": "N von M hat|haben Datenschutzbedenken, aber das Gerät erfasst keine Bewegungsdaten. Erklären Sie, was es tut",
  "RB3-09": "N von M Anwendern macht|machen sich Sorgen wegen gemeinsam genutzter Geräte. Vereinbaren Sie eine Reinigungsroutine",
  "RB3-10": "N von M empfindet|empfinden die Nutzung als verpflichtend, nicht als eigene Wahl. Das wirkt sich auf die Akzeptanz aus",
  "RB3-11": "Geringe Offenheit zusammen mit wenig Erfahrung bräuchte eine behutsamere Einführung",
  "RB3-12": "Die Führung erwartet möglicherweise weniger Widerstand, als die Anwender tatsächlich äußern",
  "RB3-13": "Die Führung erwartet Widerstand, aber keine Person nannte Sorgen um Datenschutz oder Stelle",
  "RB4-01": "Keine Installationen im Betrieb und kein Referenzkunde. Behandeln Sie diesen Anbieter als erhöhtes Risiko",
  "RB4-02": "Ein Referenzkunde wurde angeboten. Sprechen Sie ihn an, statt die Angabe ungeprüft zu übernehmen",
  "RB4-03": "IT und Informationssicherheit gestalten das nicht mit. Sie könnten es ganz blockieren",
  "RB4-04": "Der Erfolg hängt davon ab, dass auch eine andere Organisation bereit ist. Prüfen Sie das vor der Terminplanung",
  "RB4-05": "Die Marktentwicklung ist nicht bekannt. Eine kurze Marktrecherche würde das klären",
  "RB4-06": "Keines der drei Anzeichen für eine Vorreiterfähigkeit trifft zu. Planen Sie mit der Rolle eines Nachfolgers",
  "RB4-07": "Ansätze einer führenden Rolle sind da, aber der Kunde hat das noch nicht besprochen",
  "RB4-08": "Der Kunde wendet sich dafür bereits an einen anderen Anbieter. Beginnen Sie in der Rolle eines Nachfolgers",
  "RB4-09": "Der Kunde sieht uns als gesetzt, aber vertraglich ist noch nichts vereinbart",
  "RB4-10": "Der Kunde hat zugestimmt, dass wir koordinieren, aber der Vertrag deckt das nicht ab",
  "RB4-11": "Führend, aber nicht bereit, Gewinne zu teilen. Das deutet auf eine beherrschende Rolle hin",
  "RB4-12": "Mitziehend, aber nicht bereit, Daten zu teilen. Das deutet auf eine abschottende Rolle hin"
};

function plainHeadline(ruleId, flagText, language) {
  const german = pageLanguage(language) === 'de';
  const headline = german ? headlinesDe[ruleId] : headlines[ruleId];
  const text = textValue(flagText);
  if (!headline) return text;
  const counted = text.match(/\d+ of \d+/);
  const dimension = text.match(/^([A-Za-z ]+?) is needed/);
  const first = counted ? Number(counted[0].split(' of ')[0]) : 0;
  return countedText(headline, first)
    .replace(german ? 'N von M' : 'N of M', counted ? (german ? counted[0].replace(' of ', ' von ') : counted[0]) : (german ? 'einige der' : 'some of the'))
    .replace('[Dimension]', dimension ? sayText(dimension[1], language) : (german ? 'Eine nötige Fähigkeit' : 'A needed capability'));
}
