const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const secondsSinceFirstRun = figma.payments.getUserFirstRanSecondsAgo();
const daysSinceFirstRun = secondsSinceFirstRun / ONE_DAY_IN_SECONDS;

async function run() {
  if (figma.payments.status.type === "PAID") {
    figma.notify("USER HAS PAID");
  } else {
    if (daysSinceFirstRun > 3) {
      await figma.payments.initiateCheckoutAsync();
      if (figma.payments.status.type === "UNPAID") {
        figma.notify("USER CANCELLED CHECKOUT");
      } else {
        figma.notify("USER JUST SIGNED UP");
      }
    } else {
      figma.notify("USER IS IN THREE DAY TRIAL PERIOD");
    }
  }
  return figma.payments.status.type;
}

run();
