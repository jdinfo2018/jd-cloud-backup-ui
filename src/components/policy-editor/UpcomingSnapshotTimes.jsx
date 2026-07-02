import moment from "moment";
import React from "react";
import { LabelColumn } from "./LabelColumn";

export function UpcomingSnapshotTimes(resolved) {
  if (!resolved) {
    return null;
  }

  if (resolved.schedulingError) {
    return <p className="error">{resolved.schedulingError}</p>;
  }

  const times = resolved.upcomingSnapshotTimes;

  if (!times) {
    return <LabelColumn name="Nenhuma cópia agendada" />;
  }

  return (
    <>
      <LabelColumn name-="Próximas" />

      <ul data-testid="upcoming-snapshot-times">
        {times.map((x) => (
          <li key={x}>
            {moment(x).format("L LT")} ({moment(x).fromNow()})
          </li>
        ))}
      </ul>
    </>
  );
}
