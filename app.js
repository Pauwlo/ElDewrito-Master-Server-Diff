const axios = require('axios').default

const CACHE_URL = 'http://eldewrito.pauwlo.fr:7000/servers'
const QUERY_TIMEOUT = 3000
let masterServers = []

process.argv.slice(2).forEach(arg => {
	if (!arg.startsWith('http')) {
		console.error(`Invalid master server URL: ${arg}`)
		process.exit(1)
	}

	masterServers.push(arg)
})

function fetchCache(url) {
	return new Promise((resolve, reject) => {
		axios.get(url)
			.then(response => {
				const servers = response.data.map(s => {
					return s.IP
				}).sort()

				resolve(servers)
			})
			.catch(reject)
	})
}

function fetchMasterServers(urls) {
	return new Promise((resolve, reject) => {
		let results = []

		const headers = {
			'Host': 'eldewrito.red-m.net',
			'Connection': 'keep-alive',
		}

		console.log(`Fetching ${urls.length} master server${urls.length > 1 ? 's' : ''}...`)

		urls.forEach(url => {
			axios.get(url, { headers: headers })
				.then(response => {
					results.push({
						url: url,
						servers: response.data.result.servers.sort()
					})
				})
				.catch(error => {
					results.push({
						url: url,
						error: error
					})
				})
		})

		setTimeout(() => {
			if (results.length > 0) {
				resolve(results)
			} else {
				reject(results)
			}
		}, QUERY_TIMEOUT)
	})
}

function compareLists(cachedServers, masterServerLists) {
	const skippedServers = masterServerLists.filter(s => s.error !== undefined).map(s => s.url)
	masterServerLists = masterServerLists.filter(s => s.servers !== undefined)

	let missingServers = []

	masterServerLists.forEach(masterServerList => {
		const servers = masterServerList.servers
		masterServerList.missing = cachedServers.filter(s => !servers.includes(s))
		missingServers = [...new Set([...missingServers, ...masterServerList.missing])]

		console.log(`\n${masterServerList.missing.length} servers missing on ${getFriendlyName(masterServerList.url)}:`)
		masterServerList.missing.forEach(server => {
			console.log(`  - ${getFriendlyName(server)}`)

		})
	})

	missingServers.forEach(server => {
		const missingOn = masterServerLists.filter(l => l.missing.includes(server)).map(s => s.url).sort()

		if (missingOn.length > 1) {
			console.log(`\n${getFriendlyName(server)} is missing on ${missingOn.length} master servers:`)
			missingOn.forEach(masterServer => {
				console.log(`  - ${getFriendlyName(masterServer)}`)
			})
		}
	})

	console.log()

	skippedServers.forEach(server => {
		console.log(`${getFriendlyName(server)} didn't respond in time`)
	})
}

function getFriendlyName(url) {
	switch (url) {
		case 'http://158.69.166.144:8080/list':
			return `${url} (Orion)`
		case 'http://eldewrito.red-m.net/list':
			return `${url} (Red_M)`
		default:
			return url
	}
}

fetchCache(CACHE_URL)
	.then(cachedServers => {
		console.log(`PlebBrowser shows ${cachedServers.length} server${cachedServers.length > 1 ? 's' : ''} online`)

		fetchMasterServers(masterServers)
			.then(masterServersLists => {
				compareLists(cachedServers, masterServersLists)
			})
			.catch(console.error)
	})
	.catch(console.error)
