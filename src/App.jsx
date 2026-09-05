import React, { useMemo, useState } from 'react';

const STORAGE_KEY = 'pageant-index-latest-v1';

const seedState = {
  applications: [
    {
      id: 'APP-0001',
      applicant: 'Sample Applicant',
      type: 'Professional',
      role: 'Photographer',
      pathway: 'Self-indexing',
      documents: 4,
      status: 'Review',
      feeStatus: 'Not due',
      submitted: '2026-09-05',
    },
  ],
  profiles: [
    {
      id: 'PI-PH-000001',
      name: 'Sample Indexed Professional',
      type: 'Professional',
      role: 'Creative Director',
      country: 'Philippines',
      status: 'Indexed',
      identityVerified: false,
      credentialVerified: false,
      organizationConfirmed: true,
      candidateConfirmed: false,
      claimed: false,
      source: 'Official event roster',
      edition: 'Sample Pageant 2026',
    },
  ],
  organizations: [
    {
      id: 'ORG-0001',
      name: 'Sample Pageant Organization',
      country: 'Philippines',
      status: 'Recognized',
      claimed: true,
      contact: 'admin@example.test',
    },
  ],
  editions: [
    {
      id: 'ED-0001',
      organizationId: 'ORG-0001',
      name: 'Sample Pageant 2026',
      location: 'Philippines',
      date: '2026-12-12',
      rosterCount: 18,
      indexedFromRoster: 1,
      voting: 'Draft',
      tabulation: 'Draft',
      resultStatus: 'Unpublished',
    },
  ],
  voting: [
    {
      id: 'VOTE-0001',
      editionId: 'ED-0001',
      title: 'People’s Choice',
      model: 'Hybrid',
      status: 'Draft',
      opens: '2026-12-01T09:00',
      closes: '2026-12-12T18:00',
      totalVotes: 0,
      publicTotals: false,
    },
  ],
  tabulation: [
    {
      id: 'TAB-0001',
      editionId: 'ED-0001',
      status: 'Draft',
      round: 'Finals',
      judges: 5,
      candidates: 18,
      criteria: [
        { name: 'Interview', weight: 40 },
        { name: 'Stage Presence', weight: 30 },
        { name: 'Overall Impact', weight: 30 },
      ],
      locked: false,
      certified: false,
    },
  ],
  credentials: [
    {
      id: 'CARD-0001',
      profileId: 'PI-PH-000001',
      cardType: 'Indexed Tap ID',
      status: 'Ready to produce',
      nfc: true,
      qr: true,
      issued: '',
    },
  ],
  partners: [
    {
      id: 'PARTNER-0001',
      name: 'Sample Partner Hotel',
      category: 'Hotel & Resort',
      indexedOffer: 'Preferred member rate',
      verifiedOffer: 'Preferred member rate',
      eliteOffer: 'Preferred rate + priority upgrade when available',
      active: true,
    },
  ],
  elite: [],
  trust: [
    {
      id: 'TRUST-0001',
      subject: 'Sample Indexed Professional',
      type: 'Record review',
      status: 'Open',
      priority: 'Normal',
      note: 'Prototype review item. No production allegation.',
    },
  ],
  activity: [
    { id: 'ACT-1', text: 'Frontend prototype initialized.', at: '2026-09-05 08:00' },
  ],
  settings: {
    frontendOnly: true,
    globalBrand: true,
    philippinesFirst: true,
    automaticEventIndexing: true,
    feeIncludesTapCard: true,
  },
};

function readState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedState;
  } catch {
    return seedState;
  }
}

function usePersistentState() {
  const [data, setData] = useState(readState);
  const update = (updater, activityText) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      const stamped = activityText
        ? {
            ...next,
            activity: [
              { id: crypto.randomUUID(), text: activityText, at: new Date().toLocaleString() },
              ...(next.activity || []),
            ].slice(0, 50),
          }
        : next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
      return stamped;
    });
  };
  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(seedState);
  };
  return [data, update, reset];
}

const nav = [
  'Overview',
  'Applications',
  'Profiles',
  'Organizations',
  'Editions',
  'Voting',
  'Tabulation',
  'Credentials',
  'Privileges',
  'Elite',
  'Trust',
  'Settings',
];

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Button({ children, kind = 'primary', ...props }) {
  return (
    <button className={`button button-${kind}`} {...props}>
      {children}
    </button>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Overview({ data, setSection }) {
  const activeVotes = data.voting.filter((item) => item.status === 'Live').length;
  const openReviews = data.applications.filter((item) => item.status === 'Review').length;
  return (
    <>
      <SectionHeader
        title="Command overview"
        description="Operate the Index, official Voting, Tabulation, credentials and privileges from one control surface."
      />
      <div className="metric-grid">
        <Metric label="Indexed records" value={data.profiles.length} detail={`${data.profiles.filter((p) => !p.claimed).length} unclaimed`} />
        <Metric label="Applications" value={openReviews} detail="awaiting eligibility review" />
        <Metric label="Organizations" value={data.organizations.length} detail={`${data.editions.length} editions`} />
        <Metric label="Live voting" value={activeVotes} detail={`${data.voting.reduce((sum, vote) => sum + vote.totalVotes, 0)} recorded votes`} />
      </div>

      <div className="split-grid top-gap">
        <div className="panel">
          <h3>Operating queue</h3>
          <div className="queue">
            <button onClick={() => setSection('Applications')}>
              <span>Eligibility reviews</span><strong>{openReviews}</strong>
            </button>
            <button onClick={() => setSection('Credentials')}>
              <span>Cards to produce</span><strong>{data.credentials.filter((c) => c.status !== 'Issued').length}</strong>
            </button>
            <button onClick={() => setSection('Trust')}>
              <span>Trust cases</span><strong>{data.trust.filter((c) => c.status === 'Open').length}</strong>
            </button>
            <button onClick={() => setSection('Tabulation')}>
              <span>Tabulation workspaces</span><strong>{data.tabulation.length}</strong>
            </button>
          </div>
        </div>
        <div className="panel dark-panel">
          <h3>Canonical operating rule</h3>
          <p className="large-copy">An organizer that contracts Pageant Index for Voting or Tabulation creates a legitimate path for event workers to become indexable for their documented roles.</p>
          <p>Automatic event indexing confirms only the specific event relationship. It does not create unrelated verification authority.</p>
        </div>
      </div>

      <div className="panel top-gap">
        <h3>Recent activity</h3>
        <div className="activity-list">
          {data.activity.slice(0, 8).map((item) => (
            <div key={item.id}><span>{item.text}</span><small>{item.at}</small></div>
          ))}
        </div>
      </div>
    </>
  );
}

function Applications({ data, update }) {
  const setStatus = (id, status) => {
    update((state) => ({
      ...state,
      applications: state.applications.map((app) => app.id === id ? { ...app, status, feeStatus: status === 'Eligible' ? 'Due after approval' : app.feeStatus } : app),
    }), `${id} moved to ${status}.`);
  };

  const createIndexedProfile = (application) => {
    if (data.profiles.some((p) => p.name === application.applicant)) return;
    const profileId = `PI-PH-${String(data.profiles.length + 2).padStart(6, '0')}`;
    update((state) => ({
      ...state,
      applications: state.applications.map((app) => app.id === application.id ? { ...app, status: 'Indexed', feeStatus: 'Paid / prototype' } : app),
      profiles: [...state.profiles, {
        id: profileId,
        name: application.applicant,
        type: application.type,
        role: application.role,
        country: 'Philippines',
        status: 'Indexed',
        identityVerified: false,
        credentialVerified: false,
        organizationConfirmed: false,
        candidateConfirmed: false,
        claimed: true,
        source: 'Self-indexing application',
        edition: '',
      }],
      credentials: [...state.credentials, {
        id: `CARD-${String(state.credentials.length + 2).padStart(4, '0')}`,
        profileId,
        cardType: 'Indexed Tap ID',
        status: 'Ready to produce',
        nfc: true,
        qr: true,
        issued: '',
      }],
    }), `${application.applicant} indexed; Tap ID production record created.`);
  };

  return (
    <>
      <SectionHeader title="Applications & eligibility" description="Self-indexing is document-based. Payment completes an approved credentialing pathway; it never buys eligibility." />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Applicant</th><th>Pathway</th><th>Evidence</th><th>Status</th><th>Fee</th><th>Actions</th></tr></thead>
          <tbody>
            {data.applications.map((app) => (
              <tr key={app.id}>
                <td><strong>{app.applicant}</strong><small>{app.role} · {app.type}</small></td>
                <td>{app.pathway}</td>
                <td>{app.documents} documents</td>
                <td><Badge tone={app.status === 'Indexed' ? 'good' : app.status === 'Rejected' ? 'danger' : 'gold'}>{app.status}</Badge></td>
                <td>{app.feeStatus}</td>
                <td className="actions">
                  {app.status === 'Review' && <Button kind="secondary" onClick={() => setStatus(app.id, 'Eligible')}>Approve eligibility</Button>}
                  {app.status === 'Eligible' && <Button onClick={() => createIndexedProfile(app)}>Complete indexing</Button>}
                  {!['Indexed', 'Rejected'].includes(app.status) && <Button kind="ghost" onClick={() => setStatus(app.id, 'Rejected')}>Reject</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="policy-note"><strong>Fee includes:</strong> approved profile publication, permanent Pageant Index ID, initial credential record, NFC Tap ID Card and QR-linked canonical profile, subject to package/delivery terms.</div>
    </>
  );
}

function Profiles({ data, update }) {
  const toggle = (id, key) => update((state) => ({ ...state, profiles: state.profiles.map((p) => p.id === id ? { ...p, [key]: !p[key] } : p) }), `Profile ${id} ${key} updated.`);
  return (
    <>
      <SectionHeader title="Indexed profiles" description="Indexed status, identity verification and relationship confirmations remain separate trust states." />
      <div className="record-grid">
        {data.profiles.map((profile) => (
          <article className="record" key={profile.id}>
            <div className="record-top"><div className="avatar">{profile.name.slice(0, 1)}</div><div><h3>{profile.name}</h3><p>{profile.role} · {profile.country}</p></div></div>
            <div className="badge-row">
              <Badge tone="good">Indexed</Badge>
              {profile.organizationConfirmed && <Badge tone="gold">Organization Confirmed</Badge>}
              {profile.candidateConfirmed && <Badge tone="gold">Candidate Confirmed</Badge>}
              {profile.identityVerified && <Badge tone="good">Identity Verified</Badge>}
              {!profile.claimed && <Badge>Unclaimed</Badge>}
            </div>
            <dl><div><dt>Pageant Index ID</dt><dd>{profile.id}</dd></div><div><dt>Source</dt><dd>{profile.source}</dd></div>{profile.edition && <div><dt>Edition</dt><dd>{profile.edition}</dd></div>}</dl>
            <div className="actions wrap">
              <Button kind="secondary" onClick={() => toggle(profile.id, 'identityVerified')}>{profile.identityVerified ? 'Remove identity verification' : 'Verify identity'}</Button>
              <Button kind="ghost" onClick={() => toggle(profile.id, 'claimed')}>{profile.claimed ? 'Mark unclaimed' : 'Mark claimed'}</Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Organizations({ data, update }) {
  const [name, setName] = useState('');
  const add = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    update((state) => ({ ...state, organizations: [...state.organizations, { id: `ORG-${String(state.organizations.length + 1).padStart(4, '0')}`, name: name.trim(), country: 'Philippines', status: 'Recognized', claimed: false, contact: '' }] }), `${name.trim()} added as an organization record.`);
    setName('');
  };
  return (
    <>
      <SectionHeader title="Organizations" description="Recognized organizations can create edition records and confirm roles only within their legitimate authority." />
      <form className="inline-form" onSubmit={add}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization name" /><Button type="submit">Add organization</Button></form>
      <div className="table-wrap top-gap"><table><thead><tr><th>Organization</th><th>Country</th><th>Status</th><th>Claim</th></tr></thead><tbody>{data.organizations.map((org) => <tr key={org.id}><td><strong>{org.name}</strong><small>{org.id}</small></td><td>{org.country}</td><td><Badge tone="good">{org.status}</Badge></td><td>{org.claimed ? 'Claimed' : 'Unclaimed'}</td></tr>)}</tbody></table></div>
    </>
  );
}

function Editions({ data, update }) {
  const [form, setForm] = useState({ name: '', organizationId: data.organizations[0]?.id || '', date: '' });
  const create = (event) => {
    event.preventDefault();
    if (!form.name || !form.organizationId) return;
    update((state) => ({ ...state, editions: [...state.editions, { id: `ED-${String(state.editions.length + 1).padStart(4, '0')}`, organizationId: form.organizationId, name: form.name, location: 'Philippines', date: form.date, rosterCount: 0, indexedFromRoster: 0, voting: 'Not configured', tabulation: 'Not configured', resultStatus: 'Unpublished' }] }), `${form.name} edition created.`);
    setForm({ ...form, name: '', date: '' });
  };
  const autoIndexRoster = (edition) => {
    const newId = `PI-PH-${String(data.profiles.length + 2).padStart(6, '0')}`;
    update((state) => ({
      ...state,
      editions: state.editions.map((e) => e.id === edition.id ? { ...e, rosterCount: e.rosterCount + 1, indexedFromRoster: e.indexedFromRoster + 1 } : e),
      profiles: [...state.profiles, { id: newId, name: `Roster Member ${state.profiles.length + 1}`, type: 'Event participant', role: 'Official event role', country: 'Philippines', status: 'Indexed', identityVerified: false, credentialVerified: false, organizationConfirmed: true, candidateConfirmed: false, claimed: false, source: 'Official event roster', edition: edition.name }],
    }), `Official roster member indexed from ${edition.name}.`);
  };
  return (
    <>
      <SectionHeader title="Pageants & editions" description="An edition is the durable record connecting people, roles, Voting, Tabulation and official results." />
      <form className="inline-form three" onSubmit={create}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Edition name" />
        <select value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}>{data.organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Button type="submit">Create edition</Button>
      </form>
      <div className="record-grid top-gap">{data.editions.map((edition) => <article className="record" key={edition.id}><h3>{edition.name}</h3><p>{edition.location} · {edition.date || 'Date not set'}</p><dl><div><dt>Roster</dt><dd>{edition.rosterCount}</dd></div><div><dt>Indexed from roster</dt><dd>{edition.indexedFromRoster}</dd></div><div><dt>Results</dt><dd>{edition.resultStatus}</dd></div></dl><Button onClick={() => autoIndexRoster(edition)}>Add + auto-index roster member</Button><p className="micro">Prototype action demonstrates automatic event eligibility and organization-confirmed event relationship.</p></article>)}</div>
    </>
  );
}

function Voting({ data, update }) {
  const setVote = (id, patch, note) => update((state) => ({ ...state, voting: state.voting.map((v) => v.id === id ? { ...v, ...patch } : v) }), note);
  return (
    <>
      <SectionHeader title="Official Voting" description="Voting belongs to a real organization-authorized edition and remains distinct from judging unless explicitly configured into the scoring formula." />
      <div className="record-grid">{data.voting.map((vote) => <article className="record" key={vote.id}><div className="record-title-line"><div><h3>{vote.title}</h3><p>{vote.model} model</p></div><Badge tone={vote.status === 'Live' ? 'good' : 'gold'}>{vote.status}</Badge></div><dl><div><dt>Opens</dt><dd>{vote.opens}</dd></div><div><dt>Closes</dt><dd>{vote.closes}</dd></div><div><dt>Total votes</dt><dd>{vote.totalVotes}</dd></div></dl><label className="toggle"><input type="checkbox" checked={vote.publicTotals} onChange={(e) => setVote(vote.id, { publicTotals: e.target.checked }, `Public totals setting changed for ${vote.title}.`)} /><span>Show public totals</span></label><div className="actions wrap top-gap-small"><Button onClick={() => setVote(vote.id, { status: vote.status === 'Live' ? 'Paused' : 'Live' }, `${vote.title} ${vote.status === 'Live' ? 'paused' : 'launched'}.`)}>{vote.status === 'Live' ? 'Pause campaign' : 'Launch campaign'}</Button><Button kind="secondary" onClick={() => setVote(vote.id, { totalVotes: vote.totalVotes + 1 }, `Prototype vote recorded in ${vote.title}.`)}>Simulate vote</Button></div></article>)}</div>
    </>
  );
}

function Tabulation({ data, update }) {
  const patch = (id, changes, note) => update((state) => ({ ...state, tabulation: state.tabulation.map((t) => t.id === id ? { ...t, ...changes } : t) }), note);
  return (
    <>
      <SectionHeader title="Official Tabulation" description="Configure criteria, rounds, judges, score completeness, locks and certification. Production computation will later move to authoritative server-side services." />
      {data.tabulation.map((tab) => (
        <div className="panel" key={tab.id}>
          <div className="record-title-line"><div><h3>{tab.round}</h3><p>{tab.judges} judges · {tab.candidates} candidates</p></div><Badge tone={tab.certified ? 'good' : tab.locked ? 'gold' : 'neutral'}>{tab.certified ? 'Certified' : tab.locked ? 'Locked' : tab.status}</Badge></div>
          <div className="criteria-list">{tab.criteria.map((criterion) => <div key={criterion.name}><span>{criterion.name}</span><strong>{criterion.weight}%</strong></div>)}</div>
          <div className="weight-total">Total weight <strong>{tab.criteria.reduce((sum, c) => sum + c.weight, 0)}%</strong></div>
          <div className="actions wrap top-gap-small">
            <Button kind="secondary" onClick={() => patch(tab.id, { status: 'Open for scoring' }, `${tab.round} opened for judge scoring.`)}>Open scoring</Button>
            <Button onClick={() => patch(tab.id, { locked: !tab.locked }, `${tab.round} ${tab.locked ? 'unlocked' : 'locked'}.`)}>{tab.locked ? 'Unlock round' : 'Lock round'}</Button>
            <Button kind="ghost" disabled={!tab.locked} onClick={() => patch(tab.id, { certified: true, status: 'Certified' }, `${tab.round} certified in prototype.`)}>Certify result</Button>
          </div>
        </div>
      ))}
    </>
  );
}

function Credentials({ data, update }) {
  const profileName = (id) => data.profiles.find((p) => p.id === id)?.name || id;
  const issue = (id) => update((state) => ({ ...state, credentials: state.credentials.map((c) => c.id === id ? { ...c, status: 'Issued', issued: new Date().toISOString().slice(0, 10) } : c) }), `${id} marked issued.`);
  return (
    <>
      <SectionHeader title="Tap ID credentials" description="NFC and QR credentials open the live canonical Pageant Index profile instead of relying on static printed claims." />
      <div className="credential-grid">{data.credentials.map((card) => <article className="tap-card" key={card.id}><div className="tap-card-brand">PAGEANT INDEX</div><div><small>OFFICIAL INDEX CREDENTIAL</small><h3>{profileName(card.profileId)}</h3><p>{card.profileId}</p></div><div className="tap-meta"><span>NFC TAP</span><span>QR</span></div><div className="card-status">{card.status}</div><Button kind="light" disabled={card.status === 'Issued'} onClick={() => issue(card.id)}>{card.status === 'Issued' ? `Issued ${card.issued}` : 'Mark card issued'}</Button></article>)}</div>
    </>
  );
}

function Privileges({ data, update }) {
  const [form, setForm] = useState({ name: '', category: 'Hotel & Resort', indexedOffer: '', eliteOffer: '' });
  const add = (event) => {
    event.preventDefault();
    if (!form.name || !form.indexedOffer) return;
    update((state) => ({ ...state, partners: [...state.partners, { id: `PARTNER-${String(state.partners.length + 1).padStart(4, '0')}`, ...form, verifiedOffer: form.indexedOffer, active: true }] }), `${form.name} added to Pageant Index Privileges.`);
    setForm({ name: '', category: 'Hotel & Resort', indexedOffer: '', eliteOffer: '' });
  };
  const toggle = (id) => update((state) => ({ ...state, partners: state.partners.map((p) => p.id === id ? { ...p, active: !p.active } : p) }), `Privilege partner ${id} activation changed.`);
  return (
    <>
      <SectionHeader title="Privileges & partners" description="Indexed members may access participating partner offers. Verified and Elite tiers can unlock stronger benefits when contractually secured." />
      <form className="partner-form" onSubmit={add}>
        <input placeholder="Partner name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Hotel & Resort</option><option>Beauty & Wellness</option><option>Pageant Service</option><option>Restaurant</option><option>Transport & Travel</option><option>Production Supplier</option><option>Training</option><option>Technology</option></select>
        <input placeholder="Indexed offer" value={form.indexedOffer} onChange={(e) => setForm({ ...form, indexedOffer: e.target.value })} />
        <input placeholder="Elite offer" value={form.eliteOffer} onChange={(e) => setForm({ ...form, eliteOffer: e.target.value })} />
        <Button type="submit">Add privilege</Button>
      </form>
      <div className="table-wrap top-gap"><table><thead><tr><th>Partner</th><th>Indexed</th><th>Verified</th><th>Elite</th><th>Status</th></tr></thead><tbody>{data.partners.map((partner) => <tr key={partner.id}><td><strong>{partner.name}</strong><small>{partner.category}</small></td><td>{partner.indexedOffer}</td><td>{partner.verifiedOffer}</td><td>{partner.eliteOffer || 'Partner-defined premium offer'}</td><td><button className="status-button" onClick={() => toggle(partner.id)}><Badge tone={partner.active ? 'good' : 'neutral'}>{partner.active ? 'Active' : 'Paused'}</Badge></button></td></tr>)}</tbody></table></div>
      <div className="policy-note">Public promise: “Show, scan or tap your active Pageant Index credential to access offers from participating partners. Privileges vary by partner, location and availability.”</div>
    </>
  );
}

function Elite({ data, update }) {
  const eligible = data.profiles.filter((p) => p.identityVerified && !data.elite.some((e) => e.profileId === p.id));
  const enroll = (profile) => update((state) => ({ ...state, elite: [...state.elite, { id: `ELITE-${String(state.elite.length + 1).padStart(4, '0')}`, profileId: profile.id, status: 'Active', since: new Date().toISOString().slice(0, 10) }] }), `${profile.name} activated in Elite.`);
  return (
    <>
      <SectionHeader title="Pageant Index Elite" description="Elite is selective standing plus premium privileges. It is not a generic paid Pro account." />
      <div className="split-grid">
        <div className="panel"><h3>Active Elite</h3>{data.elite.length ? data.elite.map((member) => <div className="list-row" key={member.id}><span>{data.profiles.find((p) => p.id === member.profileId)?.name}</span><Badge tone="gold">Elite</Badge></div>) : <Empty>No Elite members in this prototype yet.</Empty>}</div>
        <div className="panel"><h3>Potentially eligible after verification</h3>{eligible.length ? eligible.map((profile) => <div className="list-row" key={profile.id}><span>{profile.name}</span><Button kind="secondary" onClick={() => enroll(profile)}>Activate Elite</Button></div>) : <Empty>Verify an eligible profile first.</Empty>}</div>
      </div>
    </>
  );
}

function Trust({ data, update }) {
  const resolve = (id) => update((state) => ({ ...state, trust: state.trust.map((item) => item.id === id ? { ...item, status: 'Resolved' } : item) }), `${id} resolved.`);
  return (
    <>
      <SectionHeader title="Trust & record integrity" description="Commercial activity never overrides evidence, official results or legitimate record corrections." />
      <div className="table-wrap"><table><thead><tr><th>Subject</th><th>Case</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>{data.trust.map((item) => <tr key={item.id}><td><strong>{item.subject}</strong><small>{item.note}</small></td><td>{item.type}</td><td>{item.priority}</td><td><Badge tone={item.status === 'Resolved' ? 'good' : 'gold'}>{item.status}</Badge></td><td><Button kind="ghost" disabled={item.status === 'Resolved'} onClick={() => resolve(item.id)}>Resolve</Button></td></tr>)}</tbody></table></div>
    </>
  );
}

function Settings({ data, update, reset }) {
  const set = (key) => update((state) => ({ ...state, settings: { ...state.settings, [key]: !state.settings[key] } }), `${key} setting changed.`);
  return (
    <>
      <SectionHeader title="System settings" description="This build intentionally has no backend. All mutations below are local to this browser." />
      <div className="panel settings-panel">
        {Object.entries(data.settings).map(([key, value]) => <label className="setting-row" key={key}><span><strong>{key.replaceAll(/([A-Z])/g, ' $1')}</strong><small>{key === 'frontendOnly' ? 'Must remain enabled during the current build phase.' : 'Canonical product configuration.'}</small></span><input type="checkbox" checked={value} disabled={key === 'frontendOnly'} onChange={() => set(key)} /></label>)}
      </div>
      <div className="danger-zone"><div><strong>Reset prototype data</strong><p>Clears browser-local changes and restores the initial demo state.</p></div><Button kind="danger" onClick={reset}>Reset local state</Button></div>
    </>
  );
}

function AdminApp({ data, update, reset, onPublic }) {
  const [section, setSection] = useState('Overview');
  const render = () => {
    const props = { data, update, reset, setSection };
    if (section === 'Overview') return <Overview {...props} />;
    if (section === 'Applications') return <Applications {...props} />;
    if (section === 'Profiles') return <Profiles {...props} />;
    if (section === 'Organizations') return <Organizations {...props} />;
    if (section === 'Editions') return <Editions {...props} />;
    if (section === 'Voting') return <Voting {...props} />;
    if (section === 'Tabulation') return <Tabulation {...props} />;
    if (section === 'Credentials') return <Credentials {...props} />;
    if (section === 'Privileges') return <Privileges {...props} />;
    if (section === 'Elite') return <Elite {...props} />;
    if (section === 'Trust') return <Trust {...props} />;
    return <Settings {...props} />;
  };
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">PI</div><div><strong>PAGEANT INDEX</strong><span>ADMIN CONSOLE</span></div></div>
        <nav>{nav.map((item) => <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}>{item}</button>)}</nav>
        <div className="sidebar-bottom"><Badge tone="gold">LOCAL PROTOTYPE</Badge><button onClick={onPublic}>View public experience</button></div>
      </aside>
      <main className="admin-main"><header className="admin-header"><div><span>PAGEANT INDEX OPERATIONS</span><strong>{section}</strong></div><div className="header-status"><i></i>Frontend only · local state</div></header><div className="content">{render()}</div></main>
    </div>
  );
}

function PublicApp({ data, onAdmin }) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => data.profiles.filter((profile) => `${profile.name} ${profile.role} ${profile.country} ${profile.edition}`.toLowerCase().includes(query.toLowerCase())), [data.profiles, query]);
  const liveVote = data.voting.find((v) => v.status === 'Live');
  return (
    <div className="public-shell">
      <header className="public-header"><div className="public-brand">PAGEANT INDEX</div><nav><a href="#index">Index</a><a href="#vote">Vote</a><a href="#credential">Credential</a><button onClick={onAdmin}>Admin</button></nav></header>
      <section className="hero"><div><h1>The Global Index<br />of Pageantry.</h1><p>A trusted record of the people, organizations, pageants, titles, professionals and relationships that shape the industry.</p><div className="hero-actions"><a className="button button-primary" href="#index">Search the Index</a><a className="text-link" href="#credential">Apply to be Indexed</a></div></div><div className="hero-index"><span>INDEX</span><span>VOTE</span><span>TABULATE</span><span>CREDENTIAL</span></div></section>
      <section className="public-section" id="index"><div className="public-section-head"><div><h2>Search Pageant Index</h2><p>Public access is open. Inclusion in the Index remains credentialed and evidence-based.</p></div><input className="public-search" placeholder="Search name, role, edition or country" value={query} onChange={(e) => setQuery(e.target.value)} /></div><div className="directory">{visible.map((profile) => <article key={profile.id}><div className="avatar large">{profile.name.slice(0, 1)}</div><h3>{profile.name}</h3><p>{profile.role} · {profile.country}</p><div className="badge-row"><Badge tone="good">Indexed</Badge>{profile.organizationConfirmed && <Badge tone="gold">Organization Confirmed</Badge>}{profile.identityVerified && <Badge tone="good">Identity Verified</Badge>}</div><small>{profile.id}</small></article>)}</div></section>
      <section className="public-section alternate" id="vote"><div className="public-section-head"><div><h2>Official Voting</h2><p>Organization-authorized voting connected directly to permanent Pageant Index edition records.</p></div></div>{liveVote ? <div className="public-feature"><div><Badge tone="good">LIVE</Badge><h3>{liveVote.title}</h3><p>{liveVote.model} voting · {liveVote.totalVotes} votes recorded in this local prototype.</p></div><Button>Open voting</Button></div> : <Empty>No public voting campaign is live right now.</Empty>}</section>
      <section className="public-section" id="credential"><div className="credential-promo"><div><h2>Apply to be Indexed.</h2><p>Eligible pageant professionals and organizations can submit supporting documents for review. After eligibility approval, the indexing and credential fee includes the official profile, permanent Pageant Index ID and NFC Tap ID Card.</p><p className="fine">Payment does not guarantee eligibility, verification or confirmation of claims.</p></div><div className="mini-card"><strong>PAGEANT INDEX</strong><span>NFC TAP ID</span><b>PI · VERIFIED LIVE PROFILE</b></div></div></section>
      <section className="public-section alternate"><div className="public-section-head"><div><h2>Indexed Privileges</h2><p>Show, scan or tap an active Pageant Index credential to access offers from participating partners. Privileges vary by partner, location and availability.</p></div></div><div className="directory">{data.partners.filter((p) => p.active).map((partner) => <article key={partner.id}><small>{partner.category}</small><h3>{partner.name}</h3><p><strong>Indexed:</strong> {partner.indexedOffer}</p><p><strong>Elite:</strong> {partner.eliteOffer}</p></article>)}</div></section>
      <footer><strong>PAGEANT INDEX</strong><span>The Global Index of Pageantry.</span><small>Frontend prototype · no production backend connected.</small></footer>
    </div>
  );
}

export default function App() {
  const [data, update, reset] = usePersistentState();
  const [mode, setMode] = useState(() => window.location.hash === '#public' ? 'public' : 'admin');
  const switchMode = (next) => {
    setMode(next);
    window.location.hash = next === 'public' ? 'public' : 'admin';
  };
  return mode === 'admin'
    ? <AdminApp data={data} update={update} reset={reset} onPublic={() => switchMode('public')} />
    : <PublicApp data={data} onAdmin={() => switchMode('admin')} />;
}
