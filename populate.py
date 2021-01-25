import os, random, requests, sys, threading, time

test_names = ["Add two numbers together",
	"Ensure pi hasn't changed",
	"1 + 1 should always equal 2 unless it's the second Sunday after Pentecost",
	"Check Skynet isn't switched on",
	"ModulationControllerFactory - Returns a valid object",
	"GET /petstore - Invalid input produces 400",
	"Are you reading these? Get a life",
	"Check teapot returns 418 over HTCP",
	"assert true == true",
	"Make a CAD payment with cash manager over SWIFT channel during a bank holiday with a Tunisian beneficiary",
	"Assert amount we can argue over test naming conventions is unbounded",
	"Would you like any toast?",
	"Here I am, brain the size of a planet, and they ask me to make up fake test case names"
]

def gen_test(is_passed, service_name, name, msg=""):
	test = "    <testcase classname=\"" + service_name + "\" name=\"" + name + "\" time=\"0.000\">\n"
	if not is_passed:
		test = test + "      <failure message=\"Failed\" type=\"\">" +  msg + "</failure>\n"
	test += "    </testcase>\n"
	return test


def gen_suite(service_name, test_name_sample):
	tests = ""
	failed = 0
	for i in range(0, 10):
		test = test_name_sample[i]
		if random.random() > 0.995 or (i == 5 and random.random() > 0.85):
			tests = tests + gen_test(False, service_name, test, "Oops")
			failed = failed + 1
		else:
			tests = tests + gen_test(True, service_name,  test)

	suite = "  <testsuite tests=\"" + str(10 - failed) + "\" failures=\"" + str(failed) + "\" time=\"0.000\" name=\"" + service_name + "\">\n"
	suite = suite + tests
	suite = suite + "  </testsuite>\n"
	return suite

def gen_suites(service_name, test_name_sample):
	suites = "<testsuites>\n"
	suites += gen_suite(service_name, test_name_sample)
	suites = suites + "</testsuites>\n"
	return suites

host = sys.argv[1]

def ingest_service(service):
	test_name_sample = random.sample(test_names, 10)
	for pr in range(1, random.randrange(10, 80)):
		for build in range(1, random.randrange(1, 15)):
			url = f"http://{host}/tests/{service}/{pr}/{build}"
			print(">>>" + url)
			r = requests.put(url, data=gen_suites(service, test_name_sample))
			print(r.status_code)
			print(r.raw)
			assert(r.status_code == 200)
			time.sleep(0.05)

threads = []
for service in ["kubernetes", "mysql", "postgresql", "spark", "rust", "testiculate", "moby",
		"linux", "flutter", "homebrew-cask", "pytorch", "electron", "rails",
		"vue", "tensorflow", "gitignore", "ohmyzsh", "react-native", "mithril.js"]:
	t = threading.Thread(target=ingest_service, args=(service,))
	threads.append(t)
	t.start()

for t in threads:
	t.join()
