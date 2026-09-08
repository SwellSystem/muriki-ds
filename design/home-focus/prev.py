import re, sys
SP='/private/tmp/claude-501/-Users-guilherme-swell-system-muriki-ds/509056d5-af43-450d-b157-7408281603f5/scratchpad'
for arq in sys.argv[1:]:
    s=open(arq).read(); i=s.index('<x-dc>'); j=s.index('</x-dc>')
    miolo=re.sub(r'<helmet>.*?</helmet>','',s[i+6:j],flags=re.S)
    alvo=f'{SP}/pv-{arq.replace(".dc.html","")}.html'
    open(alvo,'w').write('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"><style>body{margin:0}*{box-sizing:border-box}</style>'+miolo)
    print(alvo)
