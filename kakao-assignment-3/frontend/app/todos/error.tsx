"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TodosError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <main className="page-shell">
      <section className="message-panel" role="alert">
        <p className="eyebrow">Error</p>
        <h1>Todo를 처리하지 못했습니다.</h1>
        <p>백엔드 서버 연결 상태를 확인한 뒤 다시 시도해 주세요.</p>
        <div className="form-actions">
          <Link className="button button-secondary" href="/">홈으로</Link>
          <button className="button button-primary" type="button" onClick={reset}>다시 시도</button>
        </div>
      </section>
    </main>
  );
}
