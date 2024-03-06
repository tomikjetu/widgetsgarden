# WidgetsGarden

WidgetsGarden je služba, kde si môžu majitelia stránok vytvoriť widgety a v jednom riadku kódu pridať na svoj web.
WidgetsGarden poskytuje interaktívne prostredie z ktoého si môžu dynamicky widgety upravovať.

### Technology Used
- React.js
- Node.js

# Files

> Tree Structure

#### React Client

    .
    ├── public                
    ├── src                    
    ├   ├── Components                   
    ├   ├── Pages                   
    ├   ├── Styles            
    ├   ├── App.jsx            
    ├   └── index.js
    ├── README.md              
    └── package.json

#### Webserver

    .
    ├── server.js             # Entry file
    ├── server
    ├   ├──       
    ├   └──    
    └── package.json



ids:
widget id: w(16 digits) (algorithm base 16) (server)
apikey: wg(16 digits) (algorithm base 16) (server)
userid: u(16 digits) (algorithm base 16) (server)
widget data entry: d(random 10^10 to base 36) (client)
data array entry: a(random 10^10 to base 36) (client)


Test Account:
test@test.test
Test Account
Kop$2023