async function run() {
  if (figma.payments.status.type === "NOT_SUPPORTED") {
    // FOR CREATORS MIGRATING FROM OFF-PLATFORM MONETIZATION TO ON-PLATFORM:
    // This means we are pre-GA, so you should not run any code related
    // to figma on-platform payments. You should also try to not include any
    // copy or references to on-platform payments in your resource.
    // Instead, run you existing off-platform payments code.
    figma.notify("RUN OFF-PLATFORM PAYMENTS CODE");
  } else if (figma.payments.status.type === "PAID") {
    figma.notify("USER HAS PAID");
  } else {
    const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
    const secondsSinceFirstRun = figma.payments.getUserFirstRanSecondsAgo();
    const daysSinceFirstRun = secondsSinceFirstRun / ONE_DAY_IN_SECONDS;
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
  figma.closePlugin();
  return figma.payments.status.type;
}

run();
