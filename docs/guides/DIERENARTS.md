# Handleiding voor Dierenartsen

## Rol in IDSee

Als dierenarts of erkende chipper ben je de vertrouwde schakel die:
- Chips plaatst bij pups
- Dieren registreert in het systeem
- Gezondheidsgegevens vastlegt
- Als **geverifieerde dierenarts**: een **fraudesignaal kunt bevestigen** (zie onder)

> Je werkt met een gewoon IDSee-account (e-mail + wachtwoord). Geen wallet, geen
> blockchain-kennis nodig — de blockchain werkt onzichtbaar op de achtergrond.

---

## Registratie als Professional

### Vereisten

**Dierenarts:**
- BIG-registratie (actief)
- Praktijkregistratie

**Chipper:**
- NVWA certificering
- Chipper-ID

### Verificatie

Je registratie wordt geverifieerd via:
1. BIG-register / NVWA controle
2. **Peer-verificatie** door een al geverifieerde professional (credits-borg), of
   een IDSee-keuring bij de eerste gebruikers (genesis, zie VERIFICATION.md)

---

## Chip Registratie Workflow

### Stap 1: Log in op IDSee
```
IDSee App > Inloggen (e-mail + wachtwoord) > "Nieuwe Registratie"
```

### Stap 2: Scan Chip
```
Scan chipnummer of voer handmatig in (15 cijfers)
Formaat: 528-XXXX-XXXX-XXXX
```

### Stap 3: Selecteer Fokker
```
Zoek fokker op UBN/kennel
Verifieer dat fokker actief is (groene status)
```

### Stap 4: Voer Gegevens In
```
- Chipnummer moeder (indien bekend)
- Geboortedatum
- Geboorteplaats
- Land (ISO code, bijv. NL)
- Ras
- Eventuele opmerkingen
```

### Stap 5: Bevestig & Verzend
```
Bevestig de registratie (kost 1 credit)
De fokker bevestigt de registratie daarna (dubbele bevestiging)
Pas na bevestiging wordt de keten op de blockchain vastgelegd
```

---

## Gezondheidsgegevens Toevoegen

### Wanneer?
- Na vaccinatie
- Na gezondheidscontrole
- Na genetische test
- Na behandeling/operatie

### Proces

```
1. Open dier profiel (via chipnummer)
2. Klik "Gezondheidsrecord Toevoegen"
3. Selecteer type:
   - Vaccinatie
   - HealthCheck
   - GeneticTest
   - Treatment
   - Surgery
4. Upload document (wordt versleuteld)
5. Bevestig (kost 1 credit)
```

### Privacy

- Details worden NIET on-chain opgeslagen
- Alleen hash van document + type + datum
- Eigenaar kan selectief delen met kopers/verzekeraars

---

## Fraudesignaal bevestigen (geverifieerde dierenarts)

Een geverifieerde dierenarts is de menselijke controle in de fraude-respons
(`PROPOSITION.md` §4):

- Een signaal ontstaat (koper-melding, ontbrekende schakel, of jouw observatie zoals
  een omgekat buitenlands paspoort).
- **Alleen jouw bevestiging** zet een hard fraudesignaal — dit voorkomt dat een
  concurrent iemand kapotmaakt met valse claims.
- Na bevestiging verlaagt de **verifieerbaarheid** (score) van de betrokken keten,
  gradueel en anoniem via ZKP. Het is nooit een publieke beschuldiging van een persoon.

> Status: ontworpen, nog niet geïmplementeerd (B-traject).

---

## Foutafhandeling

| Fout | Oorzaak | Oplossing |
|------|---------|-----------|
| "Professional not found" | Account niet geverifieerd | Vraag verificatie aan |
| "Professional suspended" | Registratie geschorst | Hernieuw BIG/NVWA |
| "Breeder not active" | Fokker niet erkend | Fokker moet eerst registreren |
| "Chip already exists" | Dubbele registratie | Controleer chipnummer |
| "Insufficient credits" | Te weinig credits | Koop een credit-bundel |

---

## Kosten & Verdienmodel

### Registratiekosten
- 1 credit per registratie of gezondheidsrecord (zie CREDITS.md)
- Blockchain-/proof-kosten lopen via het platform — onzichtbaar voor jou

### Toekomstig
- Mogelijk: verificatie-vergoeding per check
- Mogelijk: gezondheidsdata-toegang fee

---

## Best Practices

1. **Altijd chip scannen** - nooit handmatig invoeren indien mogelijk
2. **Verifieer moeder** - controleer dat moeder geregistreerd is
3. **Directe registratie** - registreer direct na chippen
4. **Houd je BIG/NVWA-registratie actief** - anders vervalt je verificatie

---

## Support

- Technische vragen: support@idsee.app
- BIG/NVWA problemen: admin@idsee.app
- Spoedlijn: +31 XX XXX XXXX
