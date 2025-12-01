# Handleiding voor Dierenartsen

## Rol in IDSee

Als dierenarts of erkende chipper ben je de vertrouwde schakel die:
- Chips plaatst bij pups
- Dieren registreert in het systeem
- Gezondheidsgegevens vastlegt

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

Je registratie wordt geverifieerd door IDSee administrators via:
1. BIG-register controle (automatisch)
2. NVWA database (automatisch)
3. Eenmalige wallet-koppeling

---

## Chip Registratie Workflow

### Stap 1: Open IDSee App
```
IDSee App > Inloggen met wallet > "Nieuwe Registratie"
```

### Stap 2: Scan Chip
```
Scan chipnummer of voer handmatig in (15 cijfers)
Formaat: 528-XXXX-XXXX-XXXX
```

### Stap 3: Selecteer Fokker
```
Zoek fokker op naam of kennel
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

### Stap 5: Onderteken & Verzend
```
Bevestig met wallet
Transactie wordt verwerkt (~1 minuut)
Ontvang bevestiging
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
5. Onderteken met wallet
```

### Privacy

- Details worden NIET on-chain opgeslagen
- Alleen hash van document + type + datum
- Eigenaar kan selectief delen met kopers/verzekeraars

---

## Technische Details

### Transactie Structuur

```
Inputs:
  - AnimalRegistry UTxO
  - Je Professional credential

Outputs:
  - Updated AnimalRegistry
  - Fee (betaald door fokker of jij)
```

### Foutafhandeling

| Fout | Oorzaak | Oplossing |
|------|---------|-----------|
| "Professional not found" | Wallet niet geregistreerd | Contact admin |
| "Professional suspended" | Registratie geschorst | Hernieuw BIG/NVWA |
| "Breeder not active" | Fokker niet erkend | Fokker moet eerst registreren |
| "Chip already exists" | Dubbele registratie | Controleer chipnummer |

---

## Kosten & Verdienmodel

### Transactiekosten
- ~2-3 ADA per registratie
- Betaald door fokker OF verrekend in consult

### Toekomstig
- Mogelijk: verificatie-vergoeding per check
- Mogelijk: gezondheidsdata-toegang fee

---

## Best Practices

1. **Altijd chip scannen** - nooit handmatig invoeren indien mogelijk
2. **Verifieer moeder** - controleer dat moeder geregistreerd is
3. **Directe registratie** - registreer direct na chippen
4. **Backup wallet seed** - verlies geen toegang tot je credentials

---

## Support

- Technische vragen: support@idsee.app
- BIG/NVWA problemen: admin@idsee.app
- Spoedlijn: +31 XX XXX XXXX
