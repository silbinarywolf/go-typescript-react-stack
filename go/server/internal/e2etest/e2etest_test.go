package e2etest

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/chromedp/chromedp"
	"github.com/silbinarywolf/go-typescript-react-stack/go/server/internal/bootstrap"
)

const basePath = `http://localhost:8080/`

// TestMain will execute before all tests and allows us to do setup/teardown
func TestMain(m *testing.M) {
	// Search for "config.json" in current directory
	// If it's not there, look up a few directories.
	//
	// note(jae): 2021-07-20
	// "go test" runs from each *code* directory, so it cannot find
	// config.json because it does not exist within this directory.
	// So... we make it dig up.
	{
		const maxDirectoryDepth = 7
		currentWorkingDirectory, err := os.Getwd()
		if err != nil {
			panic(fmt.Sprintf("failed to get current dir: %s", err))
		}
		configBasename := "config.json"
		dir := currentWorkingDirectory
		for i := 0; i < maxDirectoryDepth; i++ {
			if _, err := os.Stat(dir + "/" + configBasename); os.IsNotExist(err) {
				dir += "/.."
				continue
			}
			// if found, exit loop
			break
		}
		// note(jae): 2021-07-20
		// do a sanity check here. This gives a better error message when the "config.json" file just doesn't exist.
		if _, err := os.Stat(dir + "/" + configBasename); os.IsNotExist(err) {
			panic(fmt.Sprintf("unable to find config: %s\nerror: %s", configBasename, err))
		}
		if dir != currentWorkingDirectory {
			if err := os.Chdir(dir); err != nil {
				panic(fmt.Sprintf("failed to get change dir: %s", err))
			}
		}
	}

	// initiate server
	bs, err := bootstrap.InitAndListen()
	if err != nil {
		panic(fmt.Errorf("%+w", err))
	}

	// start serving
	go func() {
		if err := bs.Serve(); err != nil {
			panic(fmt.Errorf("%+w", err))
		}
	}()

	// Runs all the Test*** functions
	log.Printf("starting end-to-end tests...")
	os.Exit(m.Run())
}

func TestButtonClick(t *testing.T) {
	// setup config
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", false),
	)
	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	// create chromedp
	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// run task list
	err := RunWithTimeout(
		ctx,
		5*time.Second,
		chromedp.Navigate(`http://localhost:8080/`),
		chromedp.Click(`[data-testid="testButton"]`, chromedp.NodeVisible, chromedp.ByQuery),
	)
	if err != nil {
		t.Fatalf("button click failed: %s", err)
	}
}

// RunWithTimeout will run chromedp.Run but timeout if it exceeds your given time limit
//
// Borrowed from:
// - https://github.com/chromedp/chromedp/issues/37#issuecomment-548271460
func RunWithTimeout(ctx context.Context, timeout time.Duration, actions ...chromedp.Action) error {
	timeoutContext, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	err := chromedp.Run(
		timeoutContext,
		actions...,
	)
	if err != nil {
		if err == context.DeadlineExceeded {
			// note(jae): 2021-07-20
			// provide a nicer error message than "context deadline exceeded"
			return fmt.Errorf("chromedp has timed out. Exceeded %s", timeout)
		}
		return err
	}
	return nil
}
