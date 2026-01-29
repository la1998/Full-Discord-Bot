import React from 'react';

export default function Nutzung() {
  return (
    <div style={{ padding: '2em' }}>
      <h2>📑 Nutzungsbedingungen</h2>
      <ol>
        <li>Das Webinterface darf nur von berechtigten Personen genutzt werden. Zugriffe durch Discord-Login werden protokolliert.</li>
        <li>Du bist verpflichtet, deine Aktionen im System verantwortungsvoll auszuführen. Manipulation, Missbrauch oder unautorisierte Nutzung ist untersagt.</li>
        <li>Zugriff auf sensible Funktionen (z. B. Panelverwaltung, Auditlog) ist nur für autorisierte Nutzer erlaubt (i. d. R. Discord-Administratoren oder explizit freigegebene Rollen).</li>
        <li>Das System speichert Protokolle über wichtige Aktionen (z. B. Panel erstellen/löschen), um Sicherheit und Nachvollziehbarkeit zu gewährleisten.</li>
        <li>Bei Verstoß gegen diese Regeln kann dein Zugriff jederzeit gesperrt werden.</li>
      </ol>
      <p>Der Betreiber behält sich Änderungen der Regeln jederzeit vor.</p>
    </div>
  );
}