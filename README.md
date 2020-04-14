# CryptoDataFeeds
Collection of scripts to pull cryptocurrency data from various exchanges.

### Gemini
Uses websockets to pull 1 minute candle data from the Gemini Crypto Exchange.
When initially started up, 24 hours worth of minute data is pulled.  Then, a heartbeat message is sent to keep the connection open.  Every minute, a new change is sent from Gemini's servers to the client.