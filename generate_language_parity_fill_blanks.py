#!/usr/bin/env python3
"""Generate and audit VerbsFirst fill-blank datasets across language apps.

The generated datasets intentionally use the existing frame-card row shape:
window.verbFrames = [{ question, answer, full_answer, meaning_en, ... }].
They are deterministic, inventory-aware, and conservative about exposure. Romance
datasets are full launch candidates; Russian, Greek, Latvian, and Ukrainian are
native-pattern prototypes for review before UI exposure.
"""

from __future__ import annotations

import json
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any


TODAY = "2026-05-02"
ROOT = Path("/Users/simeon/Code/VerbsFirst")
SOURCE = "curated_language_parity_fill_blanks_2026_05_02"


def load_inventory(repo: Path, rel: str = "js/verbs.full.js") -> set[str]:
    text = (repo / rel).read_text(encoding="utf-8")
    match = re.search(r"const\s+verbs\s*=\s*(\[[\s\S]*?\]);", text)
    if not match:
        raise RuntimeError(f"Could not find `const verbs = [...]` in {repo / rel}")
    verbs = json.loads(match.group(1))
    return {str(row.get("infinitive", "")).strip() for row in verbs if row.get("infinitive")}


def subjects(*items: tuple[str, str]) -> list[dict[str, str]]:
    return [{"label": label, "en": en} for label, en in items]


def pattern(
    verb: str,
    frame_type: str,
    forms: dict[str, str],
    en_forms: dict[str, str],
    contexts: list[tuple[str, str, str]],
    source_pattern: str,
) -> dict[str, Any]:
    return {
        "verb": verb,
        "frame_type": frame_type,
        "forms": forms,
        "en_forms": en_forms,
        "contexts": contexts,
        "source_pattern": source_pattern,
    }


PT_SUBJECTS = subjects(("Eu", "I"), ("Nós", "We"), ("Ela", "She"), ("Eles", "They"))
IT_SUBJECTS = subjects(("Io", "I"), ("Noi", "We"), ("Lei", "She"), ("Loro", "They"))
CA_SUBJECTS = subjects(("Jo", "I"), ("Nosaltres", "We"), ("Ella", "She"), ("Ells", "They"))
RU_SUBJECTS = subjects(("Я", "I"), ("Мы", "We"), ("Она", "She"), ("Они", "They"))
EL_SUBJECTS = subjects(("Εγώ", "I"), ("Εμείς", "We"), ("Εκείνη", "She"), ("Εκείνοι", "They"))
LV_SUBJECTS = subjects(("Es", "I"), ("Mēs", "We"), ("Viņa", "She"), ("Viņi", "They"))
UK_SUBJECTS = subjects(("Я", "I"), ("Ми", "We"), ("Вона", "She"), ("Вони", "They"))


def pt_patterns() -> list[dict[str, Any]]:
    return [
        pattern("precisar", "de_object", {"Eu": "preciso de", "Nós": "precisamos de", "Ela": "precisa de", "Eles": "precisam de"}, {"Eu": "need", "Nós": "need", "Ela": "needs", "Eles": "need"}, [
            ("Office & Admin", "ajuda antes da reunião", "help before the meeting"),
            ("Bureaucracy & Delivery", "documentos atualizados", "updated documents"),
            ("Education & Learning", "respostas claras", "clear answers"),
            ("Tech & Digital Work", "mais tempo para revisar", "more time to review"),
        ], "precisar de + noun/infinitive"),
        pattern("gostar", "de_object", {"Eu": "gosto de", "Nós": "gostamos de", "Ela": "gosta de", "Eles": "gostam de"}, {"Eu": "like", "Nós": "like", "Ela": "likes", "Eles": "like"}, [
            ("Music", "música ao vivo", "live music"),
            ("Cooking & Food", "comida simples", "simple food"),
            ("Travel & Tourism", "cidades tranquilas", "quiet cities"),
            ("Super Everyday", "conversas sem pressa", "unhurried conversations"),
        ], "gostar de + noun"),
        pattern("falar", "sobre_object", {"Eu": "falo sobre", "Nós": "falamos sobre", "Ela": "fala sobre", "Eles": "falam sobre"}, {"Eu": "talk about", "Nós": "talk about", "Ela": "talks about", "Eles": "talk about"}, [
            ("Politics & Current Events", "as notícias da manhã", "the morning news"),
            ("Office & Admin", "o plano da semana", "the week's plan"),
            ("Relationship Drama", "limites com calma", "boundaries calmly"),
            ("Education & Learning", "os erros do exercício", "the mistakes in the exercise"),
        ], "falar sobre + topic"),
        pattern("pensar", "em_object", {"Eu": "penso em", "Nós": "pensamos em", "Ela": "pensa em", "Eles": "pensam em"}, {"Eu": "think about", "Nós": "think about", "Ela": "thinks about", "Eles": "think about"}, [
            ("Tech & Digital Work", "soluções mais simples", "simpler solutions"),
            ("Travel & Tourism", "uma viagem curta", "a short trip"),
            ("Art & Design", "cores mais quentes", "warmer colors"),
            ("Super Everyday", "compras para amanhã", "shopping for tomorrow"),
        ], "pensar em + noun"),
        pattern("confiar", "em_object", {"Eu": "confio em", "Nós": "confiamos em", "Ela": "confia em", "Eles": "confiam em"}, {"Eu": "trust", "Nós": "trust", "Ela": "trusts", "Eles": "trust"}, [
            ("Relationship Drama", "pessoas que escutam", "people who listen"),
            ("Office & Admin", "dados verificados", "verified data"),
            ("Sports & Fitness", "treino constante", "steady training"),
            ("Bureaucracy & Delivery", "um processo claro", "a clear process"),
        ], "confiar em + noun"),
        pattern("contar", "com_object", {"Eu": "conto com", "Nós": "contamos com", "Ela": "conta com", "Eles": "contam com"}, {"Eu": "count on", "Nós": "count on", "Ela": "counts on", "Eles": "count on"}, [
            ("Office & Admin", "a equipe de suporte", "the support team"),
            ("Bureaucracy & Delivery", "uma resposta rápida", "a quick reply"),
            ("Relationship Drama", "amigos discretos", "discreet friends"),
            ("Tech & Digital Work", "um backup recente", "a recent backup"),
        ], "contar com + noun"),
        pattern("participar", "de_object", {"Eu": "participo de", "Nós": "participamos de", "Ela": "participa de", "Eles": "participam de"}, {"Eu": "take part in", "Nós": "take part in", "Ela": "takes part in", "Eles": "take part in"}, [
            ("Education & Learning", "oficinas práticas", "practical workshops"),
            ("Sports & Fitness", "corridas de bairro", "neighborhood races"),
            ("Politics & Current Events", "debates locais", "local debates"),
            ("Music", "ensaios abertos", "open rehearsals"),
        ], "participar de + event"),
        pattern("começar", "a_infinitive", {"Eu": "começo a", "Nós": "começamos a", "Ela": "começa a", "Eles": "começam a"}, {"Eu": "start to", "Nós": "start to", "Ela": "starts to", "Eles": "start to"}, [
            ("Super Everyday", "organizar a casa cedo", "organize the house early"),
            ("Tech & Digital Work", "testar a nova versão", "test the new version"),
            ("Education & Learning", "revisar os apontamentos", "review the notes"),
            ("Sports & Fitness", "correr antes do trabalho", "run before work"),
        ], "começar a + infinitive"),
        pattern("tentar", "zero_infinitive", {"Eu": "tento", "Nós": "tentamos", "Ela": "tenta", "Eles": "tentam"}, {"Eu": "try to", "Nós": "try to", "Ela": "tries to", "Eles": "try to"}, [
            ("Super Everyday", "resolver isso hoje", "solve this today"),
            ("Cooking & Food", "salvar o molho", "save the sauce"),
            ("Art & Design", "melhorar o contraste", "improve the contrast"),
            ("Relationship Drama", "explicar sem acusar", "explain without accusing"),
        ], "tentar + infinitive"),
        pattern("deixar", "de_infinitive", {"Eu": "deixo de", "Nós": "deixamos de", "Ela": "deixa de", "Eles": "deixam de"}, {"Eu": "stop", "Nós": "stop", "Ela": "stops", "Eles": "stop"}, [
            ("Super Everyday", "adiar decisões pequenas", "putting off small decisions"),
            ("Tech & Digital Work", "ignorar os alertas", "ignoring the alerts"),
            ("Sports & Fitness", "treinar tarde demais", "training too late"),
            ("Office & Admin", "reenviar o mesmo arquivo", "resending the same file"),
        ], "deixar de + infinitive"),
        pattern("depender", "de_object", {"Eu": "dependo de", "Nós": "dependemos de", "Ela": "depende de", "Eles": "dependem de"}, {"Eu": "depend on", "Nós": "depend on", "Ela": "depends on", "Eles": "depend on"}, [
            ("Bureaucracy & Delivery", "uma assinatura final", "a final signature"),
            ("Tech & Digital Work", "internet estável", "stable internet"),
            ("Travel & Tourism", "horários confiáveis", "reliable schedules"),
            ("Office & Admin", "aprovação da diretoria", "management approval"),
        ], "depender de + noun"),
        pattern("colaborar", "com_object", {"Eu": "colaboro com", "Nós": "colaboramos com", "Ela": "colabora com", "Eles": "colaboram com"}, {"Eu": "collaborate with", "Nós": "collaborate with", "Ela": "collaborates with", "Eles": "collaborate with"}, [
            ("Tech & Digital Work", "designers remotos", "remote designers"),
            ("Education & Learning", "professores convidados", "guest teachers"),
            ("Art & Design", "ilustradores locais", "local illustrators"),
            ("Bureaucracy & Delivery", "equipes de entrega", "delivery teams"),
        ], "colaborar com + person/group"),
        pattern("insistir", "em_object", {"Eu": "insisto em", "Nós": "insistimos em", "Ela": "insiste em", "Eles": "insistem em"}, {"Eu": "insist on", "Nós": "insist on", "Ela": "insists on", "Eles": "insist on"}, [
            ("Office & Admin", "prazos realistas", "realistic deadlines"),
            ("Relationship Drama", "uma conversa honesta", "an honest conversation"),
            ("Tech & Digital Work", "testes antes do lançamento", "testing before launch"),
            ("Super Everyday", "descansar no domingo", "resting on Sunday"),
        ], "insistir em + noun/gerund"),
        pattern("cuidar", "de_object", {"Eu": "cuido de", "Nós": "cuidamos de", "Ela": "cuida de", "Eles": "cuidam de"}, {"Eu": "take care of", "Nós": "take care of", "Ela": "takes care of", "Eles": "take care of"}, [
            ("Super Everyday", "plantas na varanda", "plants on the balcony"),
            ("Relationship Drama", "detalhes sensíveis", "sensitive details"),
            ("Bureaucracy & Delivery", "pedidos atrasados", "delayed orders"),
            ("Sports & Fitness", "alongamentos depois do treino", "stretches after training"),
        ], "cuidar de + noun"),
        pattern("desistir", "de_object", {"Eu": "desisto de", "Nós": "desistimos de", "Ela": "desiste de", "Eles": "desistem de"}, {"Eu": "give up on", "Nós": "give up on", "Ela": "gives up on", "Eles": "give up on"}, [
            ("Tech & Digital Work", "um fluxo confuso", "a confusing workflow"),
            ("Relationship Drama", "uma briga antiga", "an old fight"),
            ("Education & Learning", "um método rígido", "a rigid method"),
            ("Art & Design", "um esboço fraco", "a weak sketch"),
        ], "desistir de + noun/infinitive"),
        pattern("concordar", "com_object", {"Eu": "concordo com", "Nós": "concordamos com", "Ela": "concorda com", "Eles": "concordam com"}, {"Eu": "agree with", "Nós": "agree with", "Ela": "agrees with", "Eles": "agree with"}, [
            ("Office & Admin", "essa proposta", "that proposal"),
            ("Politics & Current Events", "parte da análise", "part of the analysis"),
            ("Relationship Drama", "a versão dela", "her version"),
            ("Education & Learning", "o comentário do professor", "the teacher's comment"),
        ], "concordar com + noun"),
        pattern("lembrar", "de_object", {"Eu": "lembro de", "Nós": "lembramos de", "Ela": "lembra de", "Eles": "lembram de"}, {"Eu": "remember", "Nós": "remember", "Ela": "remembers", "Eles": "remember"}, [
            ("Super Everyday", "fechar a janela", "to close the window"),
            ("Office & Admin", "enviar o recibo", "to send the receipt"),
            ("Travel & Tourism", "confirmar o hotel", "to confirm the hotel"),
            ("Cooking & Food", "comprar limões", "to buy lemons"),
        ], "lembrar de + noun/infinitive"),
        pattern("acostumar-se", "reflexive_a", {"Eu": "me acostumo a", "Nós": "nos acostumamos a", "Ela": "se acostuma a", "Eles": "se acostumam a"}, {"Eu": "get used to", "Nós": "get used to", "Ela": "gets used to", "Eles": "get used to"}, [
            ("Super Everyday", "rotinas novas", "new routines"),
            ("Tech & Digital Work", "reuniões curtas", "short meetings"),
            ("Travel & Tourism", "ruas movimentadas", "busy streets"),
            ("Education & Learning", "aulas em outro ritmo", "classes at a different pace"),
        ], "acostumar-se a + noun"),
        pattern("responder", "a_object", {"Eu": "respondo a", "Nós": "respondemos a", "Ela": "responde a", "Eles": "respondem a"}, {"Eu": "answer", "Nós": "answer", "Ela": "answers", "Eles": "answer"}, [
            ("Office & Admin", "e-mails urgentes", "urgent emails"),
            ("Bureaucracy & Delivery", "pedidos de informação", "requests for information"),
            ("Education & Learning", "perguntas difíceis", "difficult questions"),
            ("Relationship Drama", "mensagens delicadas", "delicate messages"),
        ], "responder a + noun"),
        pattern("voltar", "a_infinitive", {"Eu": "volto a", "Nós": "voltamos a", "Ela": "volta a", "Eles": "voltam a"}, {"Eu": "go back to", "Nós": "go back to", "Ela": "goes back to", "Eles": "go back to"}, [
            ("Super Everyday", "cozinhar em casa", "cooking at home"),
            ("Sports & Fitness", "treinar de manhã", "training in the morning"),
            ("Music", "ouvir discos antigos", "listening to old records"),
            ("Tech & Digital Work", "usar atalhos simples", "using simple shortcuts"),
        ], "voltar a + infinitive"),
        pattern("trabalhar", "em_object", {"Eu": "trabalho em", "Nós": "trabalhamos em", "Ela": "trabalha em", "Eles": "trabalham em"}, {"Eu": "work on", "Nós": "work on", "Ela": "works on", "Eles": "work on"}, [
            ("Tech & Digital Work", "uma correção pequena", "a small fix"),
            ("Art & Design", "um cartaz novo", "a new poster"),
            ("Office & Admin", "relatórios mensais", "monthly reports"),
            ("Education & Learning", "exercícios guiados", "guided exercises"),
        ], "trabalhar em + noun"),
        pattern("acreditar", "em_object", {"Eu": "acredito em", "Nós": "acreditamos em", "Ela": "acredita em", "Eles": "acreditam em"}, {"Eu": "believe in", "Nós": "believe in", "Ela": "believes in", "Eles": "believe in"}, [
            ("Relationship Drama", "segundas chances", "second chances"),
            ("Politics & Current Events", "mudanças graduais", "gradual changes"),
            ("Education & Learning", "prática diária", "daily practice"),
            ("Super Everyday", "soluções simples", "simple solutions"),
        ], "acreditar em + noun"),
        pattern("ajudar", "a_infinitive", {"Eu": "ajudo a", "Nós": "ajudamos a", "Ela": "ajuda a", "Eles": "ajudam a"}, {"Eu": "help to", "Nós": "help to", "Ela": "helps to", "Eles": "help to"}, [
            ("Office & Admin", "organizar os dados", "organize the data"),
            ("Education & Learning", "resolver dúvidas", "resolve doubts"),
            ("Relationship Drama", "baixar o tom", "lower the tone"),
            ("Sports & Fitness", "recuperar energia", "recover energy"),
        ], "ajudar a + infinitive"),
        pattern("chegar", "a_object", {"Eu": "chego a", "Nós": "chegamos a", "Ela": "chega a", "Eles": "chegam a"}, {"Eu": "reach", "Nós": "reach", "Ela": "reaches", "Eles": "reach"}, [
            ("Bureaucracy & Delivery", "um acordo simples", "a simple agreement"),
            ("Office & Admin", "uma decisão prática", "a practical decision"),
            ("Travel & Tourism", "tempo para o embarque", "the boarding time"),
            ("Education & Learning", "uma conclusão clara", "a clear conclusion"),
        ], "chegar a + noun"),
        pattern("entrar", "em_object", {"Eu": "entro em", "Nós": "entramos em", "Ela": "entra em", "Eles": "entram em"}, {"Eu": "enter", "Nós": "enter", "Ela": "enters", "Eles": "enter"}, [
            ("Office & Admin", "contato com o suporte", "contact with support"),
            ("Travel & Tourism", "um museu pequeno", "a small museum"),
            ("Tech & Digital Work", "modo de revisão", "review mode"),
            ("Super Everyday", "uma rotina nova", "a new routine"),
        ], "entrar em + noun"),
        pattern("acabar", "de_infinitive", {"Eu": "acabo de", "Nós": "acabamos de", "Ela": "acaba de", "Eles": "acabam de"}, {"Eu": "have just", "Nós": "have just", "Ela": "has just", "Eles": "have just"}, [
            ("Office & Admin", "enviar o relatório", "sent the report"),
            ("Cooking & Food", "tirar o pão do forno", "taken the bread out of the oven"),
            ("Tech & Digital Work", "salvar a cópia local", "saved the local copy"),
            ("Travel & Tourism", "confirmar os bilhetes", "confirmed the tickets"),
        ], "acabar de + infinitive"),
    ]


def it_patterns() -> list[dict[str, Any]]:
    return [
        pattern("pensare", "a_object", {"Io": "penso a", "Noi": "pensiamo a", "Lei": "pensa a", "Loro": "pensano a"}, {"Io": "think about", "Noi": "think about", "Lei": "thinks about", "Loro": "think about"}, [
            ("Tech & Digital Work", "soluzioni più semplici", "simpler solutions"),
            ("Travel & Tourism", "un viaggio breve", "a short trip"),
            ("Art & Design", "colori più caldi", "warmer colors"),
            ("Super Everyday", "la spesa di domani", "tomorrow's shopping"),
        ], "pensare a + noun"),
        pattern("parlare", "di_object", {"Io": "parlo di", "Noi": "parliamo di", "Lei": "parla di", "Loro": "parlano di"}, {"Io": "talk about", "Noi": "talk about", "Lei": "talks about", "Loro": "talk about"}, [
            ("Politics & Current Events", "notizie locali", "local news"),
            ("Office & Admin", "un cambio di programma", "a change of plan"),
            ("Relationship Drama", "confini più chiari", "clearer boundaries"),
            ("Education & Learning", "errori frequenti", "frequent mistakes"),
        ], "parlare di + noun"),
        pattern("contare", "su_object", {"Io": "conto su", "Noi": "contiamo su", "Lei": "conta su", "Loro": "contano su"}, {"Io": "count on", "Noi": "count on", "Lei": "counts on", "Loro": "count on"}, [
            ("Office & Admin", "una risposta veloce", "a quick reply"),
            ("Relationship Drama", "amici discreti", "discreet friends"),
            ("Tech & Digital Work", "un backup recente", "a recent backup"),
            ("Bureaucracy & Delivery", "istruzioni precise", "precise instructions"),
        ], "contare su + noun"),
        pattern("partecipare", "a_object", {"Io": "partecipo a", "Noi": "partecipiamo a", "Lei": "partecipa a", "Loro": "partecipano a"}, {"Io": "take part in", "Noi": "take part in", "Lei": "takes part in", "Loro": "take part in"}, [
            ("Education & Learning", "laboratori pratici", "practical workshops"),
            ("Sports & Fitness", "corse di quartiere", "neighborhood races"),
            ("Politics & Current Events", "dibattiti locali", "local debates"),
            ("Music", "prove aperte", "open rehearsals"),
        ], "partecipare a + event"),
        pattern("riuscire", "a_infinitive", {"Io": "riesco a", "Noi": "riusciamo a", "Lei": "riesce a", "Loro": "riescono a"}, {"Io": "manage to", "Noi": "manage to", "Lei": "manages to", "Loro": "manage to"}, [
            ("Tech & Digital Work", "chiudere il bug oggi", "close the bug today"),
            ("Super Everyday", "uscire in orario", "leave on time"),
            ("Education & Learning", "capire la regola", "understand the rule"),
            ("Bureaucracy & Delivery", "finire il modulo", "finish the form"),
        ], "riuscire a + infinitive"),
        pattern("provare", "a_infinitive", {"Io": "provo a", "Noi": "proviamo a", "Lei": "prova a", "Loro": "provano a"}, {"Io": "try to", "Noi": "try to", "Lei": "tries to", "Loro": "try to"}, [
            ("Cooking & Food", "salvare il sugo", "save the sauce"),
            ("Art & Design", "migliorare il contrasto", "improve the contrast"),
            ("Relationship Drama", "spiegare senza accusare", "explain without accusing"),
            ("Office & Admin", "semplificare il verbale", "simplify the minutes"),
        ], "provare a + infinitive"),
        pattern("smettere", "di_infinitive", {"Io": "smetto di", "Noi": "smettiamo di", "Lei": "smette di", "Loro": "smettono di"}, {"Io": "stop", "Noi": "stop", "Lei": "stops", "Loro": "stop"}, [
            ("Super Everyday", "rimandare piccole decisioni", "putting off small decisions"),
            ("Tech & Digital Work", "ignorare gli avvisi", "ignoring the alerts"),
            ("Sports & Fitness", "allenarsi troppo tardi", "training too late"),
            ("Office & Admin", "reinviare lo stesso file", "resending the same file"),
        ], "smettere di + infinitive"),
        pattern("dipendere", "da_object", {"Io": "dipendo da", "Noi": "dipendiamo da", "Lei": "dipende da", "Loro": "dipendono da"}, {"Io": "depend on", "Noi": "depend on", "Lei": "depends on", "Loro": "depend on"}, [
            ("Bureaucracy & Delivery", "una firma finale", "a final signature"),
            ("Tech & Digital Work", "internet stabile", "stable internet"),
            ("Travel & Tourism", "orari affidabili", "reliable schedules"),
            ("Office & Admin", "approvazione della direzione", "management approval"),
        ], "dipendere da + noun"),
        pattern("collaborare", "con_object", {"Io": "collaboro con", "Noi": "collaboriamo con", "Lei": "collabora con", "Loro": "collaborano con"}, {"Io": "collaborate with", "Noi": "collaborate with", "Lei": "collaborates with", "Loro": "collaborate with"}, [
            ("Tech & Digital Work", "designer da remoto", "remote designers"),
            ("Education & Learning", "insegnanti ospiti", "guest teachers"),
            ("Art & Design", "illustratori locali", "local illustrators"),
            ("Bureaucracy & Delivery", "squadre di consegna", "delivery teams"),
        ], "collaborare con + person/group"),
        pattern("credere", "in_object", {"Io": "credo in", "Noi": "crediamo in", "Lei": "crede in", "Loro": "credono in"}, {"Io": "believe in", "Noi": "believe in", "Lei": "believes in", "Loro": "believe in"}, [
            ("Relationship Drama", "seconde possibilità", "second chances"),
            ("Politics & Current Events", "cambiamenti graduali", "gradual changes"),
            ("Education & Learning", "pratica quotidiana", "daily practice"),
            ("Super Everyday", "soluzioni semplici", "simple solutions"),
        ], "credere in + noun"),
        pattern("insistere", "su_object", {"Io": "insisto su", "Noi": "insistiamo su", "Lei": "insiste su", "Loro": "insistono su"}, {"Io": "insist on", "Noi": "insist on", "Lei": "insists on", "Loro": "insist on"}, [
            ("Office & Admin", "scadenze realistiche", "realistic deadlines"),
            ("Relationship Drama", "una conversazione sincera", "an honest conversation"),
            ("Tech & Digital Work", "test prima del lancio", "testing before launch"),
            ("Super Everyday", "riposo la domenica", "rest on Sunday"),
        ], "insistere su + noun/gerund"),
        pattern("occupare", "reflexive_di", {"Io": "mi occupo di", "Noi": "ci occupiamo di", "Lei": "si occupa di", "Loro": "si occupano di"}, {"Io": "take care of", "Noi": "take care of", "Lei": "takes care of", "Loro": "take care of"}, [
            ("Super Everyday", "piante sul balcone", "plants on the balcony"),
            ("Relationship Drama", "dettagli sensibili", "sensitive details"),
            ("Bureaucracy & Delivery", "ordini in ritardo", "delayed orders"),
            ("Sports & Fitness", "stretching dopo l'allenamento", "stretches after training"),
        ], "occuparsi di + noun"),
        pattern("fidare", "reflexive_di", {"Io": "mi fido di", "Noi": "ci fidiamo di", "Lei": "si fida di", "Loro": "si fidano di"}, {"Io": "trust", "Noi": "trust", "Lei": "trusts", "Loro": "trust"}, [
            ("Relationship Drama", "persone che ascoltano", "people who listen"),
            ("Office & Admin", "dati verificati", "verified data"),
            ("Sports & Fitness", "allenamento costante", "steady training"),
            ("Bureaucracy & Delivery", "un processo chiaro", "a clear process"),
        ], "fidarsi di + noun/person"),
        pattern("rinunciare", "a_object", {"Io": "rinuncio a", "Noi": "rinunciamo a", "Lei": "rinuncia a", "Loro": "rinunciano a"}, {"Io": "give up", "Noi": "give up", "Lei": "gives up", "Loro": "give up"}, [
            ("Tech & Digital Work", "un flusso confuso", "a confusing workflow"),
            ("Relationship Drama", "una vecchia lite", "an old fight"),
            ("Education & Learning", "un metodo rigido", "a rigid method"),
            ("Art & Design", "uno schizzo debole", "a weak sketch"),
        ], "rinunciare a + noun"),
        pattern("abituare", "reflexive_a", {"Io": "mi abituo a", "Noi": "ci abituiamo a", "Lei": "si abitua a", "Loro": "si abituano a"}, {"Io": "get used to", "Noi": "get used to", "Lei": "gets used to", "Loro": "get used to"}, [
            ("Super Everyday", "routine nuove", "new routines"),
            ("Tech & Digital Work", "riunioni brevi", "short meetings"),
            ("Travel & Tourism", "strade affollate", "busy streets"),
            ("Education & Learning", "lezioni con un altro ritmo", "classes at a different pace"),
        ], "abituarsi a + noun"),
        pattern("ricordare", "reflexive_di", {"Io": "mi ricordo di", "Noi": "ci ricordiamo di", "Lei": "si ricorda di", "Loro": "si ricordano di"}, {"Io": "remember to", "Noi": "remember to", "Lei": "remembers to", "Loro": "remember to"}, [
            ("Super Everyday", "chiudere la finestra", "close the window"),
            ("Office & Admin", "inviare la ricevuta", "send the receipt"),
            ("Travel & Tourism", "confermare l'hotel", "confirm the hotel"),
            ("Cooking & Food", "comprare limoni", "buy lemons"),
        ], "ricordarsi di + infinitive/noun"),
        pattern("cominciare", "a_infinitive", {"Io": "comincio a", "Noi": "cominciamo a", "Lei": "comincia a", "Loro": "cominciano a"}, {"Io": "begin to", "Noi": "begin to", "Lei": "begins to", "Loro": "begin to"}, [
            ("Super Everyday", "sistemare casa presto", "tidy the house early"),
            ("Tech & Digital Work", "testare la nuova versione", "test the new version"),
            ("Education & Learning", "rivedere gli appunti", "review the notes"),
            ("Sports & Fitness", "correre prima del lavoro", "run before work"),
        ], "cominciare a + infinitive"),
        pattern("tenere", "a_object", {"Io": "tengo a", "Noi": "teniamo a", "Lei": "tiene a", "Loro": "tengono a"}, {"Io": "care about", "Noi": "care about", "Lei": "cares about", "Loro": "care about"}, [
            ("Relationship Drama", "questa amicizia", "this friendship"),
            ("Art & Design", "dettagli fatti bene", "well-made details"),
            ("Office & Admin", "regole condivise", "shared rules"),
            ("Super Everyday", "una giornata tranquilla", "a quiet day"),
        ], "tenere a + noun"),
        pattern("rispondere", "a_object", {"Io": "rispondo a", "Noi": "rispondiamo a", "Lei": "risponde a", "Loro": "rispondono a"}, {"Io": "answer", "Noi": "answer", "Lei": "answers", "Loro": "answer"}, [
            ("Office & Admin", "email urgenti", "urgent emails"),
            ("Bureaucracy & Delivery", "richieste di informazioni", "requests for information"),
            ("Education & Learning", "domande difficili", "difficult questions"),
            ("Relationship Drama", "messaggi delicati", "delicate messages"),
        ], "rispondere a + noun"),
        pattern("lavorare", "su_object", {"Io": "lavoro su", "Noi": "lavoriamo su", "Lei": "lavora su", "Loro": "lavorano su"}, {"Io": "work on", "Noi": "work on", "Lei": "works on", "Loro": "work on"}, [
            ("Tech & Digital Work", "una correzione piccola", "a small fix"),
            ("Art & Design", "un nuovo manifesto", "a new poster"),
            ("Office & Admin", "rapporti mensili", "monthly reports"),
            ("Education & Learning", "esercizi guidati", "guided exercises"),
        ], "lavorare su + noun"),
        pattern("tornare", "a_infinitive", {"Io": "torno a", "Noi": "torniamo a", "Lei": "torna a", "Loro": "tornano a"}, {"Io": "go back to", "Noi": "go back to", "Lei": "goes back to", "Loro": "go back to"}, [
            ("Super Everyday", "cucinare in casa", "cooking at home"),
            ("Sports & Fitness", "allenarsi al mattino", "training in the morning"),
            ("Music", "ascoltare vecchi dischi", "listening to old records"),
            ("Tech & Digital Work", "usare scorciatoie semplici", "using simple shortcuts"),
        ], "tornare a + infinitive"),
        pattern("reagire", "a_object", {"Io": "reagisco a", "Noi": "reagiamo a", "Lei": "reagisce a", "Loro": "reagiscono a"}, {"Io": "react to", "Noi": "react to", "Lei": "reacts to", "Loro": "react to"}, [
            ("Relationship Drama", "critiche improvvise", "sudden criticism"),
            ("Tech & Digital Work", "errori di sistema", "system errors"),
            ("Sports & Fitness", "allenamenti intensi", "intense training sessions"),
            ("Politics & Current Events", "notizie inattese", "unexpected news"),
        ], "reagire a + noun"),
    ]


def ca_patterns() -> list[dict[str, Any]]:
    return [
        pattern("pensar", "en_object", {"Jo": "penso en", "Nosaltres": "pensem en", "Ella": "pensa en", "Ells": "pensen en"}, {"Jo": "think about", "Nosaltres": "think about", "Ella": "thinks about", "Ells": "think about"}, [
            ("Tech & Digital Work", "solucions més simples", "simpler solutions"),
            ("Travel & Tourism", "un viatge curt", "a short trip"),
            ("Art & Design", "colors més càlids", "warmer colors"),
            ("Super Everyday", "la compra de demà", "tomorrow's shopping"),
        ], "pensar en + noun"),
        pattern("parlar", "de_object", {"Jo": "parlo de", "Nosaltres": "parlem de", "Ella": "parla de", "Ells": "parlen de"}, {"Jo": "talk about", "Nosaltres": "talk about", "Ella": "talks about", "Ells": "talk about"}, [
            ("Politics & Current Events", "notícies locals", "local news"),
            ("Office & Admin", "un canvi de pla", "a change of plan"),
            ("Relationship Drama", "límits més clars", "clearer boundaries"),
            ("Education & Learning", "errors freqüents", "frequent mistakes"),
        ], "parlar de + noun"),
        pattern("comptar", "amb_object", {"Jo": "compto amb", "Nosaltres": "comptem amb", "Ella": "compta amb", "Ells": "compten amb"}, {"Jo": "count on", "Nosaltres": "count on", "Ella": "counts on", "Ells": "count on"}, [
            ("Office & Admin", "una resposta ràpida", "a quick reply"),
            ("Relationship Drama", "amics discrets", "discreet friends"),
            ("Tech & Digital Work", "una còpia recent", "a recent backup"),
            ("Bureaucracy & Delivery", "instruccions precises", "precise instructions"),
        ], "comptar amb + noun"),
        pattern("participar", "en_object", {"Jo": "participo en", "Nosaltres": "participem en", "Ella": "participa en", "Ells": "participen en"}, {"Jo": "take part in", "Nosaltres": "take part in", "Ella": "takes part in", "Ells": "take part in"}, [
            ("Education & Learning", "tallers pràctics", "practical workshops"),
            ("Sports & Fitness", "curses de barri", "neighborhood races"),
            ("Politics & Current Events", "debats locals", "local debates"),
            ("Music", "assajos oberts", "open rehearsals"),
        ], "participar en + event"),
        pattern("arribar", "a_infinitive", {"Jo": "arribo a", "Nosaltres": "arribem a", "Ella": "arriba a", "Ells": "arriben a"}, {"Jo": "manage to", "Nosaltres": "manage to", "Ella": "manages to", "Ells": "manage to"}, [
            ("Tech & Digital Work", "tancar l'error avui", "close the bug today"),
            ("Super Everyday", "sortir a l'hora", "leave on time"),
            ("Education & Learning", "entendre la regla", "understand the rule"),
            ("Bureaucracy & Delivery", "acabar el formulari", "finish the form"),
        ], "arribar a + infinitive"),
        pattern("ajudar", "a_infinitive", {"Jo": "ajudo a", "Nosaltres": "ajudem a", "Ella": "ajuda a", "Ells": "ajuden a"}, {"Jo": "help to", "Nosaltres": "help to", "Ella": "helps to", "Ells": "help to"}, [
            ("Office & Admin", "ordenar les dades", "organize the data"),
            ("Education & Learning", "resoldre dubtes", "resolve doubts"),
            ("Relationship Drama", "baixar el to", "lower the tone"),
            ("Sports & Fitness", "recuperar energia", "recover energy"),
        ], "ajudar a + infinitive"),
        pattern("començar", "a_infinitive", {"Jo": "començo a", "Nosaltres": "comencem a", "Ella": "comença a", "Ells": "comencen a"}, {"Jo": "start to", "Nosaltres": "start to", "Ella": "starts to", "Ells": "start to"}, [
            ("Super Everyday", "endreçar la casa d'hora", "tidy the house early"),
            ("Tech & Digital Work", "provar la nova versió", "test the new version"),
            ("Education & Learning", "repassar els apunts", "review the notes"),
            ("Sports & Fitness", "córrer abans de la feina", "run before work"),
        ], "començar a + infinitive"),
        pattern("intentar", "zero_infinitive", {"Jo": "intento", "Nosaltres": "intentem", "Ella": "intenta", "Ells": "intenten"}, {"Jo": "try to", "Nosaltres": "try to", "Ella": "tries to", "Ells": "try to"}, [
            ("Cooking & Food", "salvar la salsa", "save the sauce"),
            ("Art & Design", "millorar el contrast", "improve the contrast"),
            ("Relationship Drama", "explicar sense acusar", "explain without accusing"),
            ("Office & Admin", "simplificar l'acta", "simplify the minutes"),
        ], "intentar + infinitive"),
        pattern("deixar", "de_infinitive", {"Jo": "deixo de", "Nosaltres": "deixem de", "Ella": "deixa de", "Ells": "deixen de"}, {"Jo": "stop", "Nosaltres": "stop", "Ella": "stops", "Ells": "stop"}, [
            ("Super Everyday", "ajornar decisions petites", "putting off small decisions"),
            ("Tech & Digital Work", "ignorar els avisos", "ignoring the alerts"),
            ("Sports & Fitness", "entrenar massa tard", "training too late"),
            ("Office & Admin", "reenviar el mateix fitxer", "resending the same file"),
        ], "deixar de + infinitive"),
        pattern("dependre", "de_object", {"Jo": "depenc de", "Nosaltres": "depenem de", "Ella": "depèn de", "Ells": "depenen de"}, {"Jo": "depend on", "Nosaltres": "depend on", "Ella": "depends on", "Ells": "depend on"}, [
            ("Bureaucracy & Delivery", "una signatura final", "a final signature"),
            ("Tech & Digital Work", "internet estable", "stable internet"),
            ("Travel & Tourism", "horaris fiables", "reliable schedules"),
            ("Office & Admin", "aprovació de direcció", "management approval"),
        ], "dependre de + noun"),
        pattern("col·laborar", "amb_object", {"Jo": "col·laboro amb", "Nosaltres": "col·laborem amb", "Ella": "col·labora amb", "Ells": "col·laboren amb"}, {"Jo": "collaborate with", "Nosaltres": "collaborate with", "Ella": "collaborates with", "Ells": "collaborate with"}, [
            ("Tech & Digital Work", "dissenyadors remots", "remote designers"),
            ("Education & Learning", "professors convidats", "guest teachers"),
            ("Art & Design", "il·lustradors locals", "local illustrators"),
            ("Bureaucracy & Delivery", "equips de repartiment", "delivery teams"),
        ], "col·laborar amb + person/group"),
        pattern("confiar", "en_object", {"Jo": "confio en", "Nosaltres": "confiem en", "Ella": "confia en", "Ells": "confien en"}, {"Jo": "trust", "Nosaltres": "trust", "Ella": "trusts", "Ells": "trust"}, [
            ("Relationship Drama", "persones que escolten", "people who listen"),
            ("Office & Admin", "dades verificades", "verified data"),
            ("Sports & Fitness", "entrenament constant", "steady training"),
            ("Bureaucracy & Delivery", "un procés clar", "a clear process"),
        ], "confiar en + noun/person"),
        pattern("insistir", "en_object", {"Jo": "insisteixo en", "Nosaltres": "insistim en", "Ella": "insisteix en", "Ells": "insisteixen en"}, {"Jo": "insist on", "Nosaltres": "insist on", "Ella": "insists on", "Ells": "insist on"}, [
            ("Office & Admin", "terminis realistes", "realistic deadlines"),
            ("Relationship Drama", "una conversa sincera", "an honest conversation"),
            ("Tech & Digital Work", "proves abans del llançament", "testing before launch"),
            ("Super Everyday", "descansar diumenge", "resting on Sunday"),
        ], "insistir en + noun/gerund"),
        pattern("cuidar", "de_object", {"Jo": "cuido de", "Nosaltres": "cuidem de", "Ella": "cuida de", "Ells": "cuiden de"}, {"Jo": "take care of", "Nosaltres": "take care of", "Ella": "takes care of", "Ells": "take care of"}, [
            ("Super Everyday", "plantes al balcó", "plants on the balcony"),
            ("Relationship Drama", "detalls sensibles", "sensitive details"),
            ("Bureaucracy & Delivery", "comandes endarrerides", "delayed orders"),
            ("Sports & Fitness", "estiraments després d'entrenar", "stretches after training"),
        ], "cuidar de + noun"),
        pattern("renunciar", "a_object", {"Jo": "renuncio a", "Nosaltres": "renunciem a", "Ella": "renuncia a", "Ells": "renuncien a"}, {"Jo": "give up", "Nosaltres": "give up", "Ella": "gives up", "Ells": "give up"}, [
            ("Tech & Digital Work", "un flux confús", "a confusing workflow"),
            ("Relationship Drama", "una baralla antiga", "an old fight"),
            ("Education & Learning", "un mètode rígid", "a rigid method"),
            ("Art & Design", "un esbós fluix", "a weak sketch"),
        ], "renunciar a + noun"),
        pattern("recordar-se", "reflexive_de", {"Jo": "em recordo de", "Nosaltres": "ens recordem de", "Ella": "es recorda de", "Ells": "es recorden de"}, {"Jo": "remember to", "Nosaltres": "remember to", "Ella": "remembers to", "Ells": "remember to"}, [
            ("Super Everyday", "tancar la finestra", "close the window"),
            ("Office & Admin", "enviar el rebut", "send the receipt"),
            ("Travel & Tourism", "confirmar l'hotel", "confirm the hotel"),
            ("Cooking & Food", "comprar llimones", "buy lemons"),
        ], "recordar-se de + infinitive/noun"),
        pattern("acostumar-se", "reflexive_a", {"Jo": "m'acostumo a", "Nosaltres": "ens acostumem a", "Ella": "s'acostuma a", "Ells": "s'acostumen a"}, {"Jo": "get used to", "Nosaltres": "get used to", "Ella": "gets used to", "Ells": "get used to"}, [
            ("Super Everyday", "rutines noves", "new routines"),
            ("Tech & Digital Work", "reunions breus", "short meetings"),
            ("Travel & Tourism", "carrers plens de gent", "busy streets"),
            ("Education & Learning", "classes amb un altre ritme", "classes at a different pace"),
        ], "acostumar-se a + noun"),
        pattern("treballar", "en_object", {"Jo": "treballo en", "Nosaltres": "treballem en", "Ella": "treballa en", "Ells": "treballen en"}, {"Jo": "work on", "Nosaltres": "work on", "Ella": "works on", "Ells": "work on"}, [
            ("Tech & Digital Work", "una correcció petita", "a small fix"),
            ("Art & Design", "un cartell nou", "a new poster"),
            ("Office & Admin", "informes mensuals", "monthly reports"),
            ("Education & Learning", "exercicis guiats", "guided exercises"),
        ], "treballar en + noun"),
        pattern("respondre", "a_object", {"Jo": "responc a", "Nosaltres": "responem a", "Ella": "respon a", "Ells": "responen a"}, {"Jo": "answer", "Nosaltres": "answer", "Ella": "answers", "Ells": "answer"}, [
            ("Office & Admin", "correus urgents", "urgent emails"),
            ("Bureaucracy & Delivery", "peticions d'informació", "requests for information"),
            ("Education & Learning", "preguntes difícils", "difficult questions"),
            ("Relationship Drama", "missatges delicats", "delicate messages"),
        ], "respondre a + noun"),
        pattern("tornar", "a_infinitive", {"Jo": "torno a", "Nosaltres": "tornem a", "Ella": "torna a", "Ells": "tornen a"}, {"Jo": "go back to", "Nosaltres": "go back to", "Ella": "goes back to", "Ells": "go back to"}, [
            ("Super Everyday", "cuinar a casa", "cooking at home"),
            ("Sports & Fitness", "entrenar al matí", "training in the morning"),
            ("Music", "escoltar discos antics", "listening to old records"),
            ("Tech & Digital Work", "fer servir dreceres simples", "using simple shortcuts"),
        ], "tornar a + infinitive"),
        pattern("creure", "en_object", {"Jo": "crec en", "Nosaltres": "creiem en", "Ella": "creu en", "Ells": "creuen en"}, {"Jo": "believe in", "Nosaltres": "believe in", "Ella": "believes in", "Ells": "believe in"}, [
            ("Relationship Drama", "segones oportunitats", "second chances"),
            ("Politics & Current Events", "canvis graduals", "gradual changes"),
            ("Education & Learning", "pràctica diària", "daily practice"),
            ("Super Everyday", "solucions senzilles", "simple solutions"),
        ], "creure en + noun"),
        pattern("reaccionar", "a_object", {"Jo": "reacciono a", "Nosaltres": "reaccionem a", "Ella": "reacciona a", "Ells": "reaccionen a"}, {"Jo": "react to", "Nosaltres": "react to", "Ella": "reacts to", "Ells": "react to"}, [
            ("Relationship Drama", "crítiques sobtades", "sudden criticism"),
            ("Tech & Digital Work", "errors de sistema", "system errors"),
            ("Sports & Fitness", "entrenaments intensos", "intense training sessions"),
            ("Politics & Current Events", "notícies inesperades", "unexpected news"),
        ], "reaccionar a + noun"),
        pattern("jugar", "a_object", {"Jo": "jugo a", "Nosaltres": "juguem a", "Ella": "juga a", "Ells": "juguen a"}, {"Jo": "play", "Nosaltres": "play", "Ella": "plays", "Ells": "play"}, [
            ("Sports & Fitness", "tennis els dissabtes", "tennis on Saturdays"),
            ("Music", "ritmes senzills", "simple rhythms"),
            ("Super Everyday", "cartes al tren", "cards on the train"),
            ("Travel & Tourism", "jocs curts a l'hotel", "short games at the hotel"),
        ], "jugar a + noun"),
        pattern("aprendre", "a_infinitive", {"Jo": "aprenc a", "Nosaltres": "aprenem a", "Ella": "aprèn a", "Ells": "aprenen a"}, {"Jo": "learn to", "Nosaltres": "learn to", "Ella": "learns to", "Ells": "learn to"}, [
            ("Education & Learning", "fer preguntes millors", "ask better questions"),
            ("Cooking & Food", "preparar arròs sec", "prepare dry rice"),
            ("Tech & Digital Work", "llegir els registres", "read the logs"),
            ("Travel & Tourism", "moure's per la ciutat", "get around the city"),
        ], "aprendre a + infinitive"),
        pattern("preguntar", "per_object", {"Jo": "pregunto per", "Nosaltres": "preguntem per", "Ella": "pregunta per", "Ells": "pregunten per"}, {"Jo": "ask about", "Nosaltres": "ask about", "Ella": "asks about", "Ells": "ask about"}, [
            ("Office & Admin", "la pròxima data límit", "the next deadline"),
            ("Travel & Tourism", "els horaris del tren", "the train schedule"),
            ("Cooking & Food", "opcions sense fruits secs", "nut-free options"),
            ("Relationship Drama", "el que va passar ahir", "what happened yesterday"),
        ], "preguntar per + noun"),
        pattern("acabar", "de_infinitive", {"Jo": "acabo de", "Nosaltres": "acabem de", "Ella": "acaba de", "Ells": "acaben de"}, {"Jo": "have just", "Nosaltres": "have just", "Ella": "has just", "Ells": "have just"}, [
            ("Office & Admin", "enviar l'informe", "sent the report"),
            ("Cooking & Food", "treure el pa del forn", "taken the bread out of the oven"),
            ("Tech & Digital Work", "desar la còpia local", "saved the local copy"),
            ("Travel & Tourism", "confirmar els bitllets", "confirmed the tickets"),
        ], "acabar de + infinitive"),
    ]


def prototype_patterns(language: str) -> tuple[list[dict[str, Any]], list[dict[str, str]], str]:
    if language == "russian":
        return [
            pattern("думать", "prepositional_case", {"Я": "думаю о", "Мы": "думаем о", "Она": "думает о", "Они": "думают о"}, {"Я": "think about", "Мы": "think about", "Она": "thinks about", "Они": "think about"}, [("Tech & Digital Work", "новом проекте", "the new project"), ("Super Everyday", "планах на вечер", "plans for the evening")], "думать о + prepositional"),
            pattern("говорить", "prepositional_case", {"Я": "говорю о", "Мы": "говорим о", "Она": "говорит о", "Они": "говорят о"}, {"Я": "talk about", "Мы": "talk about", "Она": "talks about", "Они": "talk about"}, [("Politics & Current Events", "местных новостях", "local news"), ("Relationship Drama", "личных границах", "personal boundaries")], "говорить о + prepositional"),
            pattern("работать", "government_instrumental", {"Я": "работаю над", "Мы": "работаем над", "Она": "работает над", "Они": "работают над"}, {"Я": "work on", "Мы": "work on", "Она": "works on", "Они": "work on"}, [("Tech & Digital Work", "новой версией", "the new version"), ("Art & Design", "афишей для концерта", "the poster for the concert")], "работать над + instrumental"),
            pattern("играть", "prepositional_accusative", {"Я": "играю в", "Мы": "играем в", "Она": "играет в", "Они": "играют в"}, {"Я": "play", "Мы": "play", "Она": "plays", "Они": "play"}, [("Sports & Fitness", "теннис по субботам", "tennis on Saturdays"), ("Music", "джаз вечером", "jazz in the evening")], "играть в + accusative"),
            pattern("помогать", "dative_government", {"Я": "помогаю", "Мы": "помогаем", "Она": "помогает", "Они": "помогают"}, {"Я": "help", "Мы": "help", "Она": "helps", "Они": "help"}, [("Bureaucracy & Delivery", "клиенту с формой", "the client with the form"), ("Education & Learning", "студентам с заданием", "students with the assignment")], "помогать + dative"),
            pattern("звонить", "dative_government", {"Я": "звоню", "Мы": "звоним", "Она": "звонит", "Они": "звонят"}, {"Я": "call", "Мы": "call", "Она": "calls", "Они": "call"}, [("Office & Admin", "менеджеру утром", "the manager in the morning"), ("Travel & Tourism", "в отель перед поездкой", "the hotel before the trip")], "звонить + dative/to"),
            pattern("ждать", "object_government", {"Я": "жду", "Мы": "ждём", "Она": "ждёт", "Они": "ждут"}, {"Я": "wait for", "Мы": "wait for", "Она": "waits for", "Они": "wait for"}, [("Bureaucracy & Delivery", "ответа от службы поддержки", "a reply from support"), ("Travel & Tourism", "поезда на платформе", "the train on the platform")], "ждать + genitive/accusative"),
            pattern("пользоваться", "instrumental_government", {"Я": "пользуюсь", "Мы": "пользуемся", "Она": "пользуется", "Они": "пользуются"}, {"Я": "use", "Мы": "use", "Она": "uses", "Они": "use"}, [("Tech & Digital Work", "старым ноутбуком", "an old laptop"), ("Super Everyday", "общей кухней", "the shared kitchen")], "пользоваться + instrumental"),
            pattern("готовиться", "preposition_k", {"Я": "готовлюсь к", "Мы": "готовимся к", "Она": "готовится к", "Они": "готовятся к"}, {"Я": "prepare for", "Мы": "prepare for", "Она": "prepares for", "Они": "prepare for"}, [("Education & Learning", "экзамену по истории", "the history exam"), ("Office & Admin", "важной встрече", "an important meeting")], "готовиться к + dative"),
            pattern("интересоваться", "instrumental_government", {"Я": "интересуюсь", "Мы": "интересуемся", "Она": "интересуется", "Они": "интересуются"}, {"Я": "am interested in", "Мы": "are interested in", "Она": "is interested in", "Они": "are interested in"}, [("History & Culture", "современной историей", "modern history"), ("Art & Design", "уличным искусством", "street art")], "интересоваться + instrumental"),
            pattern("верить", "prepositional_v", {"Я": "верю в", "Мы": "верим в", "Она": "верит в", "Они": "верят в"}, {"Я": "believe in", "Мы": "believe in", "Она": "believes in", "Они": "believe in"}, [("Relationship Drama", "честный разговор", "an honest conversation"), ("Politics & Current Events", "медленные реформы", "slow reforms")], "верить в + accusative"),
            pattern("соглашаться", "instrumental_s", {"Я": "соглашаюсь с", "Мы": "соглашаемся с", "Она": "соглашается с", "Они": "соглашаются с"}, {"Я": "agree with", "Мы": "agree with", "Она": "agrees with", "Они": "agree with"}, [("Office & Admin", "этим решением", "this decision"), ("Education & Learning", "замечанием преподавателя", "the teacher's comment")], "соглашаться с + instrumental"),
        ], RU_SUBJECTS, "ru"
    if language == "greek":
        return [
            pattern("μιλάω", "preposition_gia", {"Εγώ": "μιλάω για", "Εμείς": "μιλάμε για", "Εκείνη": "μιλάει για", "Εκείνοι": "μιλάνε για"}, {"Εγώ": "talk about", "Εμείς": "talk about", "Εκείνη": "talks about", "Εκείνοι": "talk about"}, [("Politics & Current Events", "τοπικές ειδήσεις", "local news"), ("Relationship Drama", "προσωπικά όρια", "personal boundaries")], "μιλάω για + noun"),
            pattern("πιστεύω", "preposition_se", {"Εγώ": "πιστεύω σε", "Εμείς": "πιστεύουμε σε", "Εκείνη": "πιστεύει σε", "Εκείνοι": "πιστεύουν σε"}, {"Εγώ": "believe in", "Εμείς": "believe in", "Εκείνη": "believes in", "Εκείνοι": "believe in"}, [("Relationship Drama", "δεύτερες ευκαιρίες", "second chances"), ("Education & Learning", "καθημερινή πρακτική", "daily practice")], "πιστεύω σε + noun"),
            pattern("συμφωνώ", "preposition_me", {"Εγώ": "συμφωνώ με", "Εμείς": "συμφωνούμε με", "Εκείνη": "συμφωνεί με", "Εκείνοι": "συμφωνούν με"}, {"Εγώ": "agree with", "Εμείς": "agree with", "Εκείνη": "agrees with", "Εκείνοι": "agree with"}, [("Office & Admin", "αυτή την πρόταση", "this proposal"), ("Politics & Current Events", "μέρος της ανάλυσης", "part of the analysis")], "συμφωνώ με + noun"),
            pattern("αρχίζω", "na_clause", {"Εγώ": "αρχίζω να", "Εμείς": "αρχίζουμε να", "Εκείνη": "αρχίζει να", "Εκείνοι": "αρχίζουν να"}, {"Εγώ": "start to", "Εμείς": "start to", "Εκείνη": "starts to", "Εκείνοι": "start to"}, [("Super Everyday", "οργανώνω το σπίτι νωρίς", "organize the house early"), ("Tech & Digital Work", "δοκιμάζω τη νέα έκδοση", "test the new version")], "αρχίζω να + verb"),
            pattern("προσπαθώ", "na_clause", {"Εγώ": "προσπαθώ να", "Εμείς": "προσπαθούμε να", "Εκείνη": "προσπαθεί να", "Εκείνοι": "προσπαθούν να"}, {"Εγώ": "try to", "Εμείς": "try to", "Εκείνη": "tries to", "Εκείνοι": "try to"}, [("Cooking & Food", "σώσω τη σάλτσα", "save the sauce"), ("Relationship Drama", "εξηγήσω χωρίς κατηγορία", "explain without accusing")], "προσπαθώ να + verb"),
            pattern("σταματώ", "na_clause", {"Εγώ": "σταματώ να", "Εμείς": "σταματάμε να", "Εκείνη": "σταματάει να", "Εκείνοι": "σταματούν να"}, {"Εγώ": "stop", "Εμείς": "stop", "Εκείνη": "stops", "Εκείνοι": "stop"}, [("Super Everyday", "αναβάλλω μικρές αποφάσεις", "putting off small decisions"), ("Tech & Digital Work", "αγνοώ τις ειδοποιήσεις", "ignoring the alerts")], "σταματώ να + verb"),
            pattern("ετοιμάζομαι", "preposition_gia", {"Εγώ": "ετοιμάζομαι για", "Εμείς": "ετοιμαζόμαστε για", "Εκείνη": "ετοιμάζεται για", "Εκείνοι": "ετοιμάζονται για"}, {"Εγώ": "prepare for", "Εμείς": "prepare for", "Εκείνη": "prepares for", "Εκείνοι": "prepare for"}, [("Education & Learning", "τις εξετάσεις", "the exams"), ("Office & Admin", "μια σημαντική συνάντηση", "an important meeting")], "ετοιμάζομαι για + noun"),
            pattern("φροντίζω", "preposition_gia", {"Εγώ": "φροντίζω για", "Εμείς": "φροντίζουμε για", "Εκείνη": "φροντίζει για", "Εκείνοι": "φροντίζουν για"}, {"Εγώ": "take care of", "Εμείς": "take care of", "Εκείνη": "takes care of", "Εκείνοι": "take care of"}, [("Super Everyday", "τα φυτά στο μπαλκόνι", "the plants on the balcony"), ("Bureaucracy & Delivery", "καθυστερημένες παραγγελίες", "delayed orders")], "φροντίζω για + noun"),
            pattern("εξαρτώμαι", "preposition_apo", {"Εγώ": "εξαρτώμαι από", "Εμείς": "εξαρτόμαστε από", "Εκείνη": "εξαρτάται από", "Εκείνοι": "εξαρτώνται από"}, {"Εγώ": "depend on", "Εμείς": "depend on", "Εκείνη": "depends on", "Εκείνοι": "depend on"}, [("Tech & Digital Work", "σταθερό ίντερνετ", "stable internet"), ("Bureaucracy & Delivery", "μια τελική υπογραφή", "a final signature")], "εξαρτώμαι από + noun"),
            pattern("συμμετέχω", "preposition_se", {"Εγώ": "συμμετέχω σε", "Εμείς": "συμμετέχουμε σε", "Εκείνη": "συμμετέχει σε", "Εκείνοι": "συμμετέχουν σε"}, {"Εγώ": "take part in", "Εμείς": "take part in", "Εκείνη": "takes part in", "Εκείνοι": "take part in"}, [("Education & Learning", "πρακτικά εργαστήρια", "practical workshops"), ("Music", "ανοιχτές πρόβες", "open rehearsals")], "συμμετέχω σε + event"),
            pattern("ρωτάω", "preposition_gia", {"Εγώ": "ρωτάω για", "Εμείς": "ρωτάμε για", "Εκείνη": "ρωτάει για", "Εκείνοι": "ρωτούν για"}, {"Εγώ": "ask about", "Εμείς": "ask about", "Εκείνη": "asks about", "Εκείνοι": "ask about"}, [("Travel & Tourism", "το πρόγραμμα των τρένων", "the train schedule"), ("Office & Admin", "την επόμενη προθεσμία", "the next deadline")], "ρωτάω για + noun"),
            pattern("επιστρέφω", "preposition_se", {"Εγώ": "επιστρέφω σε", "Εμείς": "επιστρέφουμε σε", "Εκείνη": "επιστρέφει σε", "Εκείνοι": "επιστρέφουν σε"}, {"Εγώ": "return to", "Εμείς": "return to", "Εκείνη": "returns to", "Εκείνοι": "return to"}, [("Super Everyday", "παλιές συνήθειες", "old habits"), ("Tech & Digital Work", "απλές συντομεύσεις", "simple shortcuts")], "επιστρέφω σε + noun"),
        ], EL_SUBJECTS, "el"
    if language == "latvian":
        return [
            pattern("domāt", "preposition_par", {"Es": "domāju par", "Mēs": "domājam par", "Viņa": "domā par", "Viņi": "domā par"}, {"Es": "think about", "Mēs": "think about", "Viņa": "thinks about", "Viņi": "think about"}, [("Tech & Digital Work", "jauno projektu", "the new project"), ("Super Everyday", "vakara plāniem", "plans for the evening")], "domāt par + accusative/dative"),
            pattern("runāt", "preposition_par", {"Es": "runāju par", "Mēs": "runājam par", "Viņa": "runā par", "Viņi": "runā par"}, {"Es": "talk about", "Mēs": "talk about", "Viņa": "talks about", "Viņi": "talk about"}, [("Politics & Current Events", "vietējām ziņām", "local news"), ("Relationship Drama", "personīgām robežām", "personal boundaries")], "runāt par + noun"),
            pattern("strādāt", "preposition_pie", {"Es": "strādāju pie", "Mēs": "strādājam pie", "Viņa": "strādā pie", "Viņi": "strādā pie"}, {"Es": "work on", "Mēs": "work on", "Viņa": "works on", "Viņi": "work on"}, [("Tech & Digital Work", "jaunās versijas", "the new version"), ("Art & Design", "koncerta afišas", "the concert poster")], "strādāt pie + genitive"),
            pattern("palīdzēt", "dative_government", {"Es": "palīdzu", "Mēs": "palīdzam", "Viņa": "palīdz", "Viņi": "palīdz"}, {"Es": "help", "Mēs": "help", "Viņa": "helps", "Viņi": "help"}, [("Bureaucracy & Delivery", "klientam ar veidlapu", "the client with the form"), ("Education & Learning", "studentiem ar uzdevumu", "students with the assignment")], "palīdzēt + dative"),
            pattern("zvanīt", "dative_government", {"Es": "zvanu", "Mēs": "zvanām", "Viņa": "zvana", "Viņi": "zvana"}, {"Es": "call", "Mēs": "call", "Viņa": "calls", "Viņi": "call"}, [("Office & Admin", "vadītājam no rīta", "the manager in the morning"), ("Travel & Tourism", "viesnīcai pirms brauciena", "the hotel before the trip")], "zvanīt + dative"),
            pattern("gaidīt", "object_government", {"Es": "gaidu", "Mēs": "gaidām", "Viņa": "gaida", "Viņi": "gaida"}, {"Es": "wait for", "Mēs": "wait for", "Viņa": "waits for", "Viņi": "wait for"}, [("Bureaucracy & Delivery", "atbildi no atbalsta", "a reply from support"), ("Travel & Tourism", "vilcienu uz perona", "the train on the platform")], "gaidīt + accusative"),
            pattern("rūpēties", "preposition_par", {"Es": "rūpējos par", "Mēs": "rūpējamies par", "Viņa": "rūpējas par", "Viņi": "rūpējas par"}, {"Es": "take care of", "Mēs": "take care of", "Viņa": "takes care of", "Viņi": "take care of"}, [("Super Everyday", "augiem uz balkona", "the plants on the balcony"), ("Bureaucracy & Delivery", "kavētiem pasūtījumiem", "delayed orders")], "rūpēties par + accusative/dative"),
            pattern("piedalīties", "locative_government", {"Es": "piedalos", "Mēs": "piedalāmies", "Viņa": "piedalās", "Viņi": "piedalās"}, {"Es": "take part in", "Mēs": "take part in", "Viņa": "takes part in", "Viņi": "take part in"}, [("Education & Learning", "praktiskās darbnīcās", "practical workshops"), ("Music", "atklātos mēģinājumos", "open rehearsals")], "piedalīties + locative"),
            pattern("gatavoties", "dative_government", {"Es": "gatavojos", "Mēs": "gatavojamies", "Viņa": "gatavojas", "Viņi": "gatavojas"}, {"Es": "prepare for", "Mēs": "prepare for", "Viņa": "prepares for", "Viņi": "prepare for"}, [("Education & Learning", "vēstures eksāmenam", "the history exam"), ("Office & Admin", "svarīgai sapulcei", "an important meeting")], "gatavoties + dative"),
            pattern("interesēties", "preposition_par", {"Es": "interesējos par", "Mēs": "interesējamies par", "Viņa": "interesējas par", "Viņi": "interesējas par"}, {"Es": "am interested in", "Mēs": "are interested in", "Viņa": "is interested in", "Viņi": "are interested in"}, [("History & Culture", "mūsdienu vēsturi", "modern history"), ("Art & Design", "ielu mākslu", "street art")], "interesēties par + noun"),
            pattern("ticēt", "dative_government", {"Es": "ticu", "Mēs": "ticam", "Viņa": "tic", "Viņi": "tic"}, {"Es": "believe in", "Mēs": "believe in", "Viņa": "believes in", "Viņi": "believe in"}, [("Relationship Drama", "godīgai sarunai", "an honest conversation"), ("Politics & Current Events", "lēnām reformām", "slow reforms")], "ticēt + dative"),
            pattern("vienoties", "preposition_par", {"Es": "vienojos par", "Mēs": "vienojamies par", "Viņa": "vienojas par", "Viņi": "vienojas par"}, {"Es": "agree on", "Mēs": "agree on", "Viņa": "agrees on", "Viņi": "agree on"}, [("Office & Admin", "kopīgu grafiku", "a shared schedule"), ("Relationship Drama", "mierīgu risinājumu", "a calm solution")], "vienoties par + accusative"),
        ], LV_SUBJECTS, "lv"
    if language == "ukrainian":
        return [
            pattern("думати", "preposition_pro", {"Я": "думаю про", "Ми": "думаємо про", "Вона": "думає про", "Вони": "думають про"}, {"Я": "think about", "Ми": "think about", "Вона": "thinks about", "Вони": "think about"}, [("Tech & Digital Work", "новий проєкт", "the new project"), ("Super Everyday", "плани на вечір", "plans for the evening")], "думати про + accusative"),
            pattern("говорити", "preposition_pro", {"Я": "говорю про", "Ми": "говоримо про", "Вона": "говорить про", "Вони": "говорять про"}, {"Я": "talk about", "Ми": "talk about", "Вона": "talks about", "Вони": "talk about"}, [("Politics & Current Events", "місцеві новини", "local news"), ("Relationship Drama", "особисті межі", "personal boundaries")], "говорити про + accusative"),
            pattern("працювати", "instrumental_nad", {"Я": "працюю над", "Ми": "працюємо над", "Вона": "працює над", "Вони": "працюють над"}, {"Я": "work on", "Ми": "work on", "Вона": "works on", "Вони": "work on"}, [("Tech & Digital Work", "новою версією", "the new version"), ("Art & Design", "афішею для концерту", "the poster for the concert")], "працювати над + instrumental"),
            pattern("грати", "preposition_v", {"Я": "граю в", "Ми": "граємо в", "Вона": "грає в", "Вони": "грають в"}, {"Я": "play", "Ми": "play", "Вона": "plays", "Вони": "play"}, [("Sports & Fitness", "теніс щосуботи", "tennis on Saturdays"), ("Music", "джаз увечері", "jazz in the evening")], "грати в + accusative"),
            pattern("допомагати", "dative_government", {"Я": "допомагаю", "Ми": "допомагаємо", "Вона": "допомагає", "Вони": "допомагають"}, {"Я": "help", "Ми": "help", "Вона": "helps", "Вони": "help"}, [("Bureaucracy & Delivery", "клієнтові з формою", "the client with the form"), ("Education & Learning", "студентам із завданням", "students with the assignment")], "допомагати + dative"),
            pattern("телефонувати", "dative_government", {"Я": "телефоную", "Ми": "телефонуємо", "Вона": "телефонує", "Вони": "телефонують"}, {"Я": "call", "Ми": "call", "Вона": "calls", "Вони": "call"}, [("Office & Admin", "менеджеру вранці", "the manager in the morning"), ("Travel & Tourism", "до готелю перед поїздкою", "the hotel before the trip")], "телефонувати + dative/to"),
            pattern("чекати", "preposition_na", {"Я": "чекаю на", "Ми": "чекаємо на", "Вона": "чекає на", "Вони": "чекають на"}, {"Я": "wait for", "Ми": "wait for", "Вона": "waits for", "Вони": "wait for"}, [("Bureaucracy & Delivery", "відповідь від підтримки", "a reply from support"), ("Travel & Tourism", "потяг на платформі", "the train on the platform")], "чекати на + accusative"),
            pattern("користуватися", "instrumental_government", {"Я": "користуюся", "Ми": "користуємося", "Вона": "користується", "Вони": "користуються"}, {"Я": "use", "Ми": "use", "Вона": "uses", "Вони": "use"}, [("Tech & Digital Work", "старим ноутбуком", "an old laptop"), ("Super Everyday", "спільною кухнею", "the shared kitchen")], "користуватися + instrumental"),
            pattern("готуватися", "preposition_do", {"Я": "готуюся до", "Ми": "готуємося до", "Вона": "готується до", "Вони": "готуються до"}, {"Я": "prepare for", "Ми": "prepare for", "Вона": "prepares for", "Вони": "prepare for"}, [("Education & Learning", "іспиту з історії", "the history exam"), ("Office & Admin", "важливої зустрічі", "an important meeting")], "готуватися до + genitive"),
            pattern("цікавитися", "instrumental_government", {"Я": "цікавлюся", "Ми": "цікавимося", "Вона": "цікавиться", "Вони": "цікавляться"}, {"Я": "am interested in", "Ми": "are interested in", "Вона": "is interested in", "Вони": "are interested in"}, [("History & Culture", "сучасною історією", "modern history"), ("Art & Design", "вуличним мистецтвом", "street art")], "цікавитися + instrumental"),
            pattern("вірити", "preposition_v", {"Я": "вірю в", "Ми": "віримо в", "Вона": "вірить в", "Вони": "вірять в"}, {"Я": "believe in", "Ми": "believe in", "Вона": "believes in", "Вони": "believe in"}, [("Relationship Drama", "чесну розмову", "an honest conversation"), ("Politics & Current Events", "повільні реформи", "slow reforms")], "вірити в + accusative"),
            pattern("погоджуватися", "instrumental_z", {"Я": "погоджуюся з", "Ми": "погоджуємося з", "Вона": "погоджується з", "Вони": "погоджуються з"}, {"Я": "agree with", "Ми": "agree with", "Вона": "agrees with", "Вони": "agree with"}, [("Office & Admin", "цим рішенням", "this decision"), ("Education & Learning", "зауваженням викладача", "the teacher's comment")], "погоджуватися з + instrumental"),
        ], UK_SUBJECTS, "uk"
    raise KeyError(language)


DATASET_CONFIGS: dict[str, dict[str, Any]] = {
    "Portuguese": {
        "repo": ROOT / "portuguese-verbs",
        "code": "pt",
        "subjects": PT_SUBJECTS,
        "patterns": pt_patterns,
        "output_js": "verb_frames.portuguese.js",
        "output_json": "verb_frames.portuguese.generated.json",
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "hidden-full-seed-dataset",
        "min_questions": 300,
        "launch_gate": "hidden until the deck reaches at least 60-100 distinct verbs with broader topic variety.",
        "known_exclusions": "Object clitic replacement rows are excluded from this first pass. The Portuguese runtime still needs the frame-card UI path before exposure.",
    },
    "Italian": {
        "repo": ROOT / "italian-verbs",
        "code": "it",
        "subjects": IT_SUBJECTS,
        "patterns": it_patterns,
        "output_js": "verb_frames.js",
        "output_json": "verb_frames.generated.json",
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "prototype-only-hidden-runtime",
        "min_questions": 300,
        "launch_gate": "hidden because 22 distinct verbs is a prototype-scale deck, not enough for exposed Fill Blanks.",
        "known_exclusions": "Clitic-pronoun replacement rows are excluded from this prototype deck; the dataset focuses on Italian verb government and prepositional frames. Runtime exposure is disabled until the deck reaches at least 60-100 distinct verbs with broader topic variety.",
    },
    "Catalan": {
        "repo": ROOT / "catalan-verbs",
        "code": "ca",
        "subjects": CA_SUBJECTS,
        "patterns": ca_patterns,
        "output_js": "verb_frames.catalan.js",
        "output_json": "verb_frames.catalan.generated.json",
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "hidden-full-seed-dataset",
        "min_questions": 300,
        "launch_gate": "hidden until the deck reaches at least 60-100 distinct verbs with broader topic variety.",
        "known_exclusions": "Weak-pronoun replacement rows are excluded from this first pass. The Catalan runtime still needs the frame-card UI path before exposure.",
    },
}


PROTOTYPE_CONFIGS: dict[str, dict[str, Any]] = {
    "Russian": {"repo": ROOT / "russian-verbs", "inventory": "js/verbs.full.js", "lang_key": "russian", "output_js": "verb_frames.russian.prototype.js", "output_json": "verb_frames.russian.prototype.generated.json", "audit": "FILL_BLANKS_PROTOTYPE_AUDIT.md"},
    "Greek": {"repo": ROOT / "greek-verbs", "inventory": "greek_v1.verbs.full.js", "lang_key": "greek", "output_js": "verb_frames.greek.prototype.js", "output_json": "verb_frames.greek.prototype.generated.json", "audit": "FILL_BLANKS_PROTOTYPE_AUDIT.md"},
    "Latvian": {"repo": ROOT / "latvian-verbs", "inventory": "js/verbs.full.js", "lang_key": "latvian", "output_js": "verb_frames.latvian.prototype.js", "output_json": "verb_frames.latvian.prototype.generated.json", "audit": "FILL_BLANKS_PROTOTYPE_AUDIT.md"},
    "Ukrainian": {"repo": ROOT / "ukrainian-verbs", "inventory": "js/verbs.full.js", "lang_key": "ukrainian", "output_js": "verb_frames.ukrainian.prototype.js", "output_json": "verb_frames.ukrainian.prototype.generated.json", "audit": "FILL_BLANKS_PROTOTYPE_AUDIT.md"},
}


EXISTING_AUDITS = {
    "French": {
        "repo": ROOT / "proj1",
        "files": [
            "verb_frames.french_320.js",
            "verb_frames.french_topic_expansion.js",
            "verb_frames.french_passe_compose.js",
            "js/pronounFillRows.js",
            "js/pronounFillRows.passeCompose.js",
        ],
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "exposed",
        "known_exclusions": "French remains the reference. This audit preserves the current runtime bundle and does not regenerate French rows.",
    },
    "Spanish": {
        "repo": ROOT / "spanish-verbs",
        "files": ["verb_frames.spanish.js", "js/pronounFillRows.js"],
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "exposed",
        "known_exclusions": "This pass audits the existing Spanish generated deck; no Spanish rows are regenerated here.",
    },
    "German": {
        "repo": ROOT / "german-verbs",
        "files": ["verb_frames.german_core_types.js"],
        "audit": "FILL_BLANKS_DATA_AUDIT.md",
        "status": "exposed",
        "known_exclusions": "This pass audits the runtime-loaded German core deck. The separate separable-focus sidecar remains available but is not loaded by index.html.",
    },
}


def make_rows(
    language_name: str,
    code: str,
    subjects_config: list[dict[str, str]],
    patterns_config: list[dict[str, Any]],
    inventory: set[str],
) -> tuple[list[dict[str, Any]], list[str]]:
    rows: list[dict[str, Any]] = []
    skipped: list[str] = []
    for pat in patterns_config:
        verb = pat["verb"]
        if verb not in inventory:
            skipped.append(verb)
            continue
        for context_index, (topic, complement, complement_en) in enumerate(pat["contexts"], start=1):
            for subj in subjects_config:
                label = subj["label"]
                answer = pat["forms"][label]
                en_verb = pat["en_forms"][label]
                frame_id = f"{code}_{slugify(verb)}_{pat['frame_type']}_{context_index:02d}_{slugify(label)}"
                full_answer = f"{label} {answer} {complement}"
                meaning = sentence_case(f"{subj['en']} {en_verb} {complement_en}")
                rows.append({
                    "frame_id": frame_id,
                    "language": code,
                    "verb": verb,
                    "type": "frame",
                    "tense": "present",
                    "subject": label,
                    "question": f"{label} ____ {complement}",
                    "answer": answer,
                    "full_answer": full_answer,
                    "meaning_en": meaning,
                    "translation": meaning,
                    "frame_type": pat["frame_type"],
                    "source_pattern": pat["source_pattern"],
                    "category_name": topic,
                    "source": SOURCE,
                    "needs_review": False,
                })
    return rows, sorted(set(skipped))


def sentence_case(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    text = text[0].upper() + text[1:]
    return text if text.endswith((".", "!", "?")) else text + "."


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^\w]+", "_", value, flags=re.UNICODE)
    return value.strip("_")


def validate_rows(rows: list[dict[str, Any]], inventory: set[str], min_questions: int = 0) -> list[str]:
    issues: list[str] = []
    seen_questions: set[str] = set()
    for idx, row in enumerate(rows, start=1):
        label = row.get("frame_id") or f"row {idx}"
        for key in ("verb", "question", "answer", "full_answer", "meaning_en", "frame_type", "category_name"):
            if not str(row.get(key, "")).strip():
                issues.append(f"{label}: missing {key}")
        if "____" not in str(row.get("question", "")):
            issues.append(f"{label}: question has no blank")
        if str(row.get("verb", "")).strip() not in inventory:
            issues.append(f"{label}: verb not in runtime inventory")
        question_key = str(row.get("question", "")).strip().lower()
        if question_key in seen_questions:
            issues.append(f"{label}: duplicate question")
        seen_questions.add(question_key)
        answer = str(row.get("answer", "")).strip().lower()
        question = str(row.get("question", "")).strip().lower()
        if answer and answer in question:
            issues.append(f"{label}: answer appears in question prompt")
        if answer and answer not in str(row.get("full_answer", "")).lower():
            issues.append(f"{label}: answer not present in full_answer")
    if min_questions and len(rows) < min_questions:
        issues.append(f"dataset has {len(rows)} rows, below required minimum {min_questions}")
    small_topics = {topic: count for topic, count in Counter(row["category_name"] for row in rows).items() if count < 8}
    if min_questions >= 300 and small_topics:
        issues.append(f"tiny topic decks: {small_topics}")
    return issues


def write_js(path: Path, rows: list[dict[str, Any]]) -> None:
    payload = json.dumps(rows, ensure_ascii=False, indent=2)
    path.write_text(f"window.verbFrames = {payload};\n", encoding="utf-8")


def write_json(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def row_stats(rows: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "total": len(rows),
        "distinct_verbs": len({row.get("verb") for row in rows if row.get("verb")}),
        "families": Counter(row.get("frame_type") or row.get("family") or "unknown" for row in rows),
        "topics": Counter(row.get("category_name") or row.get("topic") or "Unlabeled" for row in rows),
        "translations": sum(1 for row in rows if row.get("meaning_en") or row.get("translation")),
    }


def write_audit(path: Path, language: str, rows: list[dict[str, Any]], validation: list[str], status: str, known_exclusions: str, skipped: list[str] | None = None, launch_gate: str = "") -> None:
    stats = row_stats(rows)
    families = ", ".join(f"{name}: {count}" for name, count in sorted(stats["families"].items()))
    topics = ", ".join(f"{name}: {count}" for name, count in sorted(stats["topics"].items()))
    samples = rows[:8]
    sample_lines = [
        "| id | family | question | answer | translation |",
        "| --- | --- | --- | --- | --- |",
    ]
    for row in samples:
        sample_lines.append(
            f"| {row.get('frame_id') or row.get('id')} | {row.get('frame_type') or row.get('family')} | {row.get('question')} | {row.get('answer')} | {row.get('meaning_en') or row.get('translation')} |"
        )
    validation_text = "PASS" if not validation else "FAIL: " + "; ".join(validation[:20])
    skipped_text = ", ".join(skipped or []) or "None"
    audit = f"""# {language} Fill Blanks Data Audit

Generated: {TODAY}

Status: {status}

## Counts

- Total questions: {stats['total']}
- Distinct verbs: {stats['distinct_verbs']}
- Question families: {families}
- Topic coverage: {topics}
{f"- Launch gate: {launch_gate}" if launch_gate else ""}
- Translations: {stats['translations']} / {stats['total']}
- TTS gap count: 0 for the browser speech path; no pre-rendered fill-frame TTS is required.
- Validator result: {validation_text}

## Samples

{chr(10).join(sample_lines)}

## Known Exclusions

{known_exclusions}

Skipped verbs not found in the runtime inventory: {skipped_text}
"""
    path.write_text(audit, encoding="utf-8")


def generate_dataset(config: dict[str, Any], language: str) -> list[dict[str, Any]]:
    repo = config["repo"]
    inventory = load_inventory(repo)
    rows, skipped = make_rows(language, config["code"], config["subjects"], config["patterns"](), inventory)
    validation = validate_rows(rows, inventory, config["min_questions"])
    write_json(repo / config["output_json"], rows)
    write_js(repo / config["output_js"], rows)
    write_audit(repo / config["audit"], language, rows, validation, config["status"], config["known_exclusions"], skipped, config.get("launch_gate", ""))
    if validation:
        raise RuntimeError(f"{language} validation failed: {validation[:5]}")
    return rows


def generate_prototype(language: str, config: dict[str, Any]) -> list[dict[str, Any]]:
    repo = config["repo"]
    patterns_config, subjects_config, code = prototype_patterns(config["lang_key"])
    inventory = load_inventory(repo, config["inventory"])
    rows, skipped = make_rows(language, code, subjects_config, patterns_config, inventory)
    validation = validate_rows(rows, inventory, 50)
    write_json(repo / config["output_json"], rows)
    write_js(repo / config["output_js"], rows)
    write_audit(
        repo / config["audit"],
        language,
        rows,
        validation,
        "prototype-hidden",
        "Prototype only. It uses language-native government/case/preposition patterns and should remain hidden until a native fill-card UI and linguistic review are complete.",
        skipped,
    )
    if validation:
        raise RuntimeError(f"{language} prototype validation failed: {validation[:5]}")
    return rows


NODE_AUDIT = r"""
const fs = require('fs');
const vm = require('vm');
const files = JSON.parse(process.argv[1]);
const sandbox = { window: {}, console };
sandbox.window.window = sandbox.window;
for (const file of files) {
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
}
const rows = [...(sandbox.window.verbFrames || []), ...(sandbox.window.pronounFillRows || [])];
process.stdout.write(JSON.stringify(rows));
"""


def load_existing_runtime_rows(repo: Path, files: list[str]) -> list[dict[str, Any]]:
    absolute = [str(repo / rel) for rel in files]
    result = subprocess.run(["node", "-e", NODE_AUDIT, json.dumps(absolute)], text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


def audit_existing(language: str, config: dict[str, Any]) -> None:
    repo = config["repo"]
    rows = load_existing_runtime_rows(repo, config["files"])
    validation = validate_existing_rows(rows)
    write_audit(repo / config["audit"], language, rows, validation, config["status"], config["known_exclusions"], [])


def validate_existing_rows(rows: list[dict[str, Any]]) -> list[str]:
    issues: list[str] = []
    seen = set()
    for row in rows:
        row_id = row.get("frame_id") or row.get("id") or "<unknown>"
        if "____" not in str(row.get("question", "")):
            issues.append(f"{row_id}: missing blank")
        if not (row.get("meaning_en") or row.get("translation") or row.get("example_en")):
            issues.append(f"{row_id}: missing English translation")
        key = " | ".join(
            str(row.get(part, "")).strip().lower()
            for part in ("full_answer", "answer", "meaning_en", "translation", "question")
        )
        if key in seen:
            issues.append(f"{row_id}: duplicate question")
        seen.add(key)
    if len(rows) < 300:
        issues.append(f"runtime has {len(rows)} rows, below 300")
    return issues


def main() -> None:
    generated: dict[str, list[dict[str, Any]]] = {}
    for language, config in DATASET_CONFIGS.items():
        generated[language] = generate_dataset(config, language)
    for language, config in PROTOTYPE_CONFIGS.items():
        generated[language] = generate_prototype(language, config)
    for language, config in EXISTING_AUDITS.items():
        audit_existing(language, config)
    summary = {language: row_stats(rows) for language, rows in generated.items()}
    print(json.dumps({name: {"total": stats["total"], "distinct_verbs": stats["distinct_verbs"]} for name, stats in summary.items()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
