let heraldCore_getAllUuidCharacter = [];
let heraldCore_getAllUser = [];
let heraldCore_switchList = "online";

async function heraldCore_renderAccessButton() {
  const existingBar = document.getElementById(
    "heraldCore-accessButtonContainer"
  );
  if (existingBar) {
    existingBar.remove();
  }

  fetch("/modules/herald-core-beta/templates/heraldCore-accessButton.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      const core = div.firstChild;
      core.id = "heraldCore-accessButtonContainer";

      const accessButton = document.createElement("button");
      accessButton.id = "heraldCore-accessButton";
      accessButton.classList.add("heraldCore-accessButton");
      accessButton.innerHTML =
        '<i class="fa-solid fa-clipboard" style="margin-left:2px;"></i>';
      accessButton.addEventListener("click", async function () {
        await heraldCore_getAllActor();
        await heraldCore_showDialogCore();
      });

      core.appendChild(accessButton);
      document.body.appendChild(core);
    })
    .catch((err) => {
      console.error("Gagal memuat template resetButton playerlist.html: ", err);
    });
}

async function heraldCore_getAllActor() {
  heraldCore_getAllUuidCharacter = [];
  heraldCore_getAllUser = [];

  heraldCore_getAllUuidCharacter = canvas.tokens.placeables
    .map((t) => t.actor)
    .filter((actor) => actor?.type === "character")
    .map((actor) => actor.uuid);

  for (let user of game.users.contents) {
    if (!user.isGM) {
      heraldCore_getAllUser.push(user);
    }
  }
}

async function heraldCore_showDialogCore() {
  let dialogContent = `
        <div id="heraldCore-dialogContainer" class="heraldCore-dialogContainer">
            <div id="heraldCore-dialogTopContainer" class="heraldCore-dialogTopContainer"></div>
            <div id="heraldCore-dialogMiddleContainer" class="heraldCore-dialogMiddleContainer"></div>
            <div id="heraldCore-dialogBottomContainer" class="heraldCore-dialogBottomContainer"></div>
        </div>
    `;

  const dialog = new Dialog({
    title: `Herald Core`,
    content: dialogContent,
    buttons: {},
    default: "add",
  });

  dialog.render(true);

  Hooks.once("renderDialog", async (app) => {
    if (app instanceof Dialog && app.title === `Herald Core`) {
      const width = 500;
      const height = 500;

      app.setPosition({
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        width: width,
        height: height,
        scale: 1.0,
      });
    }
    await heraldCore_renderDialogCoreMiddle(heraldCore_switchList);
    await heraldCore_renderDialogCoreBottom();
  });
}

async function heraldCore_renderDialogCoreMiddle(type) {
  let dialogMiddle = document.getElementById(
    "heraldCore-dialogMiddleContainer"
  );
  let listShowUserCharater = [];
  let listActor = ``;
  if (type == "online") {
    for (let user of heraldCore_getAllUser) {
      if (user.active) {
        listShowUserCharater.push({
          user: user,
          character: user.character,
        });
      }
    }
  } else if (type == "all") {
    const allCharacters = game.actors.contents.filter(
      (actor) => actor.type === "character"
    );
    for (let actor of allCharacters) {
      for (let user of heraldCore_getAllUser) {
        if (actor.ownership[user.id] >= 3) {
          listShowUserCharater.push({
            user: user,
            character: actor,
          });
          break;
        }
      }
    }
  }
  let inputSearch = document.getElementById("heraldCore-searchCoreActorInput");
  let valueSearch = "";
  if (inputSearch) {
    valueSearch = inputSearch.value.toLowerCase();
  }

  let filteredListUser = [];

  for (let data of listShowUserCharater) {
    const characterName = data.character?.name?.toLowerCase() || "";
    const userName = data.user?.name?.toLowerCase() || "";
    if (
      characterName.indexOf(valueSearch) !== -1 ||
      userName.indexOf(valueSearch) !== -1
    ) {
      filteredListUser.push(data);
    }
  }

  for (let data of filteredListUser) {
    if (!data.character || !data.user) {
      continue;
    }
    let characterName = data.character.name;
    let playerName = data.user.name;
    let uuidUser = data.user.uuid;
    let uuidActor = data.character.uuid;

    listActor += `
        <div id="heraldCore-actorContainer" class="heraldCore-actorContainer">
            <div id="heraldCore-actorLeftContainer" class="heraldCore-actorLeftContainer">
                <div id="heraldCore-characterName" class="heraldCore-characterName">${characterName}</div>
                <div id="heraldCore-playerName" class="heraldCore-playerName">${playerName}</div>
            </div>
            <div id="heraldCore-actorMiddleContainer" class="heraldCore-actorMiddleContainer">
            </div>
            <div id="heraldCore-actorRightContainer" class="heraldCore-actorRightContainer">
                <div id="heraldCore-buttonSelectPartyContainer" class="heraldCore-buttonSelectPartyContainer">
                    <button id="heraldCore-buttonSelectParty" class="heraldCore-buttonSelectParty" data-user-uuid="${uuidUser}" data-actor-uuid="${uuidActor}">Select Party</button>
                </div>
            </div>
        </div>
    `;
  }

  if (dialogMiddle) {
    dialogMiddle.innerHTML = listActor;

    const selectParty = dialogMiddle.querySelectorAll(
      ".heraldCore-buttonSelectParty"
    );
    selectParty.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const userUuid = button.getAttribute("data-user-uuid");
        const actorUuid = button.getAttribute("data-actor-uuid");
        await heraldCore_showDialogSelectParty(userUuid, actorUuid);
      });
    });
  }
}

async function heraldCore_showDialogSelectParty(userUuid, actorUuid) {
  let dialogContent = `
  <div id="heraldCore-dialogSelectPartyContainer" class="heraldCore-dialogSelectPartyContainer">
      <div id="heraldCore-selectPartyTopContainer" class="heraldCore-selectPartyTopContainer"></div>
      <div id="heraldCore-selectPartyMiddleContainer" class="heraldCore-selectPartyMiddleContainer"></div>
      <div id="heraldCore-selectPartyBottomContainer" class="heraldCore-selectPartyBottomContainer">
        <div id="heraldCore-searchSelectPartyContainer" class="heraldCore-searchSelectPartyContainer">
          <input type="text" id="heraldCore-searchSelectParty" class="heraldCore-searchSelectParty" placeholder="Search Party...">
        </div>
        <div id="heraldCore-buttonSaveSelectPartyContainer" class="heraldCore-buttonSaveSelectPartyContainer">
          <button id="heraldCore-buttonSaveSelectParty" class="heraldCore-buttonSaveSelectParty">Save</button>
        </div>
      </div>
  </div>`;

  const dialog = new Dialog({
    title: `Herald Core : Select Party`,
    content: dialogContent,
    buttons: {},
    default: "add",
  });

  dialog.render(true);

  Hooks.once("renderDialog", async (app) => {
    if (app instanceof Dialog && app.title === `Herald Core : Select Party`) {
      const width = 400;
      const height = 400;

      app.setPosition({
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        width: width,
        height: height,
        scale: 1.0,
      });
    }
    await heraldCore_renderSelectPartyMiddleContainer(userUuid, actorUuid);
    setTimeout(() => {
      let inputSearch = document.getElementById("heraldCore-searchSelectParty");

      let inputSearchTimeOut;
      inputSearch.addEventListener("input", () => {
        clearTimeout(inputSearchTimeOut);

        inputSearchTimeOut = setTimeout(async () => {
          await heraldCore_renderSelectPartyMiddleContainer(
            userUuid,
            actorUuid
          );
        }, 500);
      });

      let buttonAddParty = document.getElementById("heraldCore-buttonAddParty");
      if (buttonAddParty) {
        buttonAddParty.addEventListener("click", async () => {
          await heraldCore_showDialogCreateParty();
        });
      }

      let saveButton = document.getElementById(
        "heraldCore-buttonSaveSelectParty"
      );

      saveButton.addEventListener("click", async (event) => {
        const allCheckboxes = document.querySelectorAll(
          ".heraldCore-selectPartyCheckbox"
        );
        const allJournal = Array.from(allCheckboxes).map((checkbox) =>
          checkbox.getAttribute("data-id")
        );

        for (let journalId of allJournal) {
          const journalEntry = game.journal.get(journalId);
          if (!journalEntry) continue;
          const pagesToDelete = journalEntry.pages
            .filter((page) => page.name === `${userUuid} | ${actorUuid}`)
            .map((page) => page.id);

          if (pagesToDelete.length > 0) {
            await journalEntry.deleteEmbeddedDocuments(
              "JournalEntryPage",
              pagesToDelete
            );
          }
        }

        const checkedCheckboxes = document.querySelectorAll(
          ".heraldCore-selectPartyCheckbox:checked"
        );

        console.log(checkedCheckboxes);
        const selectedJournal = Array.from(checkedCheckboxes).map((checkbox) =>
          checkbox.getAttribute("data-id")
        );
        if (selectedJournal.length > 0) {
          for (let journalId of selectedJournal) {
            let journalEntry = game.journal.get(journalId);
            if (!journalEntry) continue;

            const pageData = {
              name: `${userUuid} | ${actorUuid}`,
              type: "text",
              text: {
                content: ``,
                format: 1,
              },
              ownership: { default: 3 },
            };
            await journalEntry.createEmbeddedDocuments("JournalEntryPage", [
              pageData,
            ]);
          }
        }
      });
    }, 500);
  });
}

async function heraldCore_renderSelectPartyMiddleContainer(
  userUuid,
  actorUuid
) {
  let dialogMiddle = document.getElementById(
    "heraldCore-selectPartyMiddleContainer"
  );

  const heraldCoreFolder = game.folders.find(
    (f) => f.name === "Herald Core" && f.type === "JournalEntry" && !f.folder
  );
  if (!heraldCoreFolder) {
    console.warn("Herald Core folder not found.");
    return;
  }
  const partyFolder = game.folders.find(
    (f) =>
      f.name === "Party" &&
      f.type === "JournalEntry" &&
      f.folder?.id === heraldCoreFolder.id
  );

  let inputSearch = document.getElementById("heraldCore-searchSelectParty");

  let valueSearch = "";
  if (inputSearch) {
    valueSearch = inputSearch.value.toLowerCase();
  }
  const partyJournals = game.journal.filter(
    (j) => j.folder?.id === partyFolder.id
  );
  let filteredJournal = [];
  for (let data of partyJournals) {
    let journalName = data.name.toLowerCase();
    if (journalName.indexOf(valueSearch) !== -1) {
      filteredJournal.push(data);
    }
  }

  let listSelectParty = ``;
  for (let journal of filteredJournal) {
    let journalName = journal.name;
    let description = journal.flags.description || "";

    let isChecked = "";
    for (let page of journal.pages) {
      if (page.name === `${userUuid} | ${actorUuid}`) {
        isChecked = "checked";
        break;
      }
    }
    listSelectParty += `
      <div id="heraldCore-listSelectPartyContainer" class="heraldCore-listSelectPartyContainer">
        <div id="heraldCore-listSelectPartyLeftContainer" class="heraldCore-listSelectPartyLeftContainer">
          <div id="heraldCore-selectPartyName" class="heraldCore-selectPartyName">${journalName}</div>
          <div id="heraldCore-selectPartyDesc" class="heraldCore-selectPartyDesc">${description}</div>
        </div>
        <div id="heraldCore-listSelectPartyMiddleContainer" class="heraldCore-listSelectPartyMiddleContainer">
        </div>
        <div id="heraldCore-listSelectPartyRightContainer" class="heraldCore-listSelectPartyRightContainer">
          <input type="checkbox" class="heraldCore-selectPartyCheckbox" data-id="${journal.id}" ${isChecked}/>
        </div>
    </div>
    `;
  }

  if (dialogMiddle) {
    dialogMiddle.innerHTML = listSelectParty;
  }
}

async function heraldCore_renderDialogCoreBottom() {
  let dialogBottom = document.getElementById(
    "heraldCore-dialogBottomContainer"
  );
  if (dialogBottom) {
    dialogBottom.innerHTML = `
        <div id="heraldCore-bottomDivContainer" class="heraldCore-bottomDivContainer">
            <div id="heraldCore-bottomTopDiv" class="heraldCore-bottomTopDiv">
                <div id="heraldCore-searchCoreActorContainer" class="heraldCore-searchCoreListActorContainer">
                     <input type="text" id="heraldCore-searchCoreActorInput" class="heraldCore-searchCoreActorInput" placeholder="Search Character...">
                </div>
            </div>
            <div id="heraldCore-bottomBottomDiv" class="heraldCore-bottomBottomDiv">
                <div id="heraldCore-buttonManagePartyContainer" class="heraldCore-buttonManagePartyContainer">
                    <button id="heraldCore-buttonManageParty" class="heraldCore-buttonManageParty">Manage Party</button>
                </div>
                 <div id="heraldCore-buttonSwitchListActorContainer" class="heraldCore-buttonSwitchListActorContainer">
                    <button id="heraldCore-buttonSwitchListActor" class="heraldCore-buttonSwitchListActor">${
                      heraldCore_switchList === "online"
                        ? "Show All Player"
                        : "Show Online Only"
                    }</button>
                </div>
            </div>
        </div>`;

    let inputSearch = document.getElementById(
      "heraldCore-searchCoreActorInput"
    );

    let inputSearchTimeOut;
    inputSearch.addEventListener("input", () => {
      clearTimeout(inputSearchTimeOut);

      inputSearchTimeOut = setTimeout(async () => {
        await heraldCore_renderDialogCoreMiddle(heraldCore_switchList);
      }, 500);
    });

    let buttonManageParty = document.getElementById(
      "heraldCore-buttonManageParty"
    );

    buttonManageParty.addEventListener("click", async () => {
      await heraldCore_showDialogManageParty();
    });

    let buttonSwitch = document.getElementById(
      "heraldCore-buttonSwitchListActor"
    );
    buttonSwitch.addEventListener("click", async () => {
      await heraldCore_switchListActorDialogCore();
    });
  }
}

async function heraldCore_showDialogManageParty() {
  let dialogContent = `
    <div id="heraldCore-dialogManagePartyContainer" class="heraldCore-dialogManagePartyContainer">
        <div id="heraldCore-managePartyTopContainer" class="heraldCore-managePartyTopContainer"></div>
        <div id="heraldCore-managePartyMiddleContainer" class="heraldCore-managePartyMiddleContainer"></div>
        <div id="heraldCore-managePartyBottomContainer" class="heraldCore-managePartyBottomContainer"></div>
    </div>`;

  const dialog = new Dialog({
    title: `Herald Core : Manage Party`,
    content: dialogContent,
    buttons: {},
    default: "add",
  });

  dialog.render(true);

  Hooks.once("renderDialog", async (app) => {
    if (app instanceof Dialog && app.title === `Herald Core : Manage Party`) {
      const width = 400;
      const height = 400;

      app.setPosition({
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        width: width,
        height: height,
        scale: 1.0,
      });
    }
    await heraldCore_renderManagePartyMiddleContainer();
    await heraldCore_renderManagePartyBottomContainer();
  });
}

async function heraldCore_renderManagePartyMiddleContainer() {
  let dialogMiddle = document.getElementById(
    "heraldCore-managePartyMiddleContainer"
  );
  const heraldCoreFolder = game.folders.find(
    (f) => f.name === "Herald Core" && f.type === "JournalEntry" && !f.folder
  );
  if (!heraldCoreFolder) {
    console.warn("Herald Core folder not found.");
    return;
  }
  const partyFolder = game.folders.find(
    (f) =>
      f.name === "Party" &&
      f.type === "JournalEntry" &&
      f.folder?.id === heraldCoreFolder.id
  );

  let inputSearch = document.getElementById(
    "heraldCore-searchManagePartyInput"
  );

  let valueSearch = "";
  if (inputSearch) {
    valueSearch = inputSearch.value.toLowerCase();
  }
  const partyJournals = game.journal.filter(
    (j) => j.folder?.id === partyFolder.id
  );
  let filteredJournal = [];

  for (let data of partyJournals) {
    let journalName = data.name.toLowerCase();
    if (journalName.indexOf(valueSearch) !== -1) {
      filteredJournal.push(data);
    }
  }
  let listParty = ``;
  for (let journal of filteredJournal) {
    let journalName = journal.name;
    let description = journal.flags.description || "";
    listParty += `
        <div id="heraldCore-listPartyContainer" class="heraldCore-listPartyContainer">
            <div id="heraldCore-listPartyLeftContainer" class="heraldCore-listPartyLeftContainer">
                <div id="heraldCore-partyName" class="heraldCore-partyName">${journalName}</div>
                <div id="heraldCore-descriptionParty" class="heraldCore-descriptionParty">${description}</div>
            </div>
            <div id="heraldCore-listPartyMiddleContainer" class="heraldCore-listPartyMiddleContainer">
            </div>
            <div id="heraldCore-listPartyRightContainer" class="heraldCore-listPartyRightContainer">
                <div id="heraldCore-buttonEditPartyContainer" class="heraldCore-buttonEditPartyContainer">
                    <i class="fa-solid fa-pen-to-square"></i>
                </div>
                <div id="heraldCore-buttonDeletePartyContainer" class="heraldCore-buttonDeletePartyContainer" data-id="${journal.id}">
                    <i class="fa-solid fa-trash"></i>
                </div>
            </div>
        </div>
    `;
  }

  if (dialogMiddle) {
    dialogMiddle.innerHTML = listParty;

    const editButtons = dialogMiddle.querySelectorAll(
      ".heraldCore-buttonEditPartyContainer"
    );

    editButtons.forEach((button, index) => {
      button.addEventListener("click", async (event) => {
        const journal = filteredJournal[index];
        if (!journal) return;

        const currentName = journal.name;
        const currentDesc = journal.flags.description || "";

        const content = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label for="heraldCore-editPartyName"><strong>Party Name</strong></label><br>
            <input type="text" id="heraldCore-editPartyName" name="heraldCore-editPartyName"
                   value="${currentName}" style="width: 100%;" placeholder="Enter party name">
          </div>
          <div>
            <label for="heraldCore-editPartyDescription"><strong>Description</strong></label><br>
            <textarea id="heraldCore-editPartyDescription" name="heraldCore-editPartyDescription"
            rows="4" style="width: 100%;" placeholder="Enter party description">${currentDesc}</textarea>
          </div>
        </div>
      `;

        new Dialog({
          title: "Herald Core: Edit Party",
          content: content,
          buttons: {
            save: {
              label: "Save",
              callback: async (html) => {
                const name = html
                  .find('[name="heraldCore-editPartyName"]')
                  .val();
                const description = html
                  .find('[name="heraldCore-editPartyDescription"]')
                  .val();

                await journal.update({
                  name: name,
                  [`flags.description`]: description,
                });

                ui.notifications.info("Party journal updated.");
                await heraldCore_renderManagePartyMiddleContainer();
              },
            },
            cancel: {
              label: "Cancel",
            },
          },
          default: "save",
        }).render(true);
      });
    });

    const deleteButtons = dialogMiddle.querySelectorAll(
      ".heraldCore-buttonDeletePartyContainer"
    );
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const journalId = button.dataset.id;
        if (!journalId) return;

        const confirmed = await Dialog.confirm({
          title: "Delete Party",
          content: `<p>Are you sure you want to delete this party journal?</p>`,
          yes: () => true,
          no: () => false,
          defaultYes: false,
        });

        if (confirmed) {
          const journal = game.journal.get(journalId);
          if (journal) {
            await journal.delete();
            ui.notifications.info("Party journal deleted.");
            await heraldCore_renderManagePartyMiddleContainer();
          }
        }
      });
    });
  }
}

async function heraldCore_renderManagePartyBottomContainer() {
  let dialogBottom = document.getElementById(
    "heraldCore-managePartyBottomContainer"
  );
  if (dialogBottom) {
    dialogBottom.innerHTML = `
        <div id="heraldCore-managePartyBottomDivContainer" class="heraldCore-managePartyBottomDivContainer">
            <div id="heraldCore-managePartyTopDiv" class="heraldCore-managePartyTopDiv">
                <div id="heraldCore-searchManagePartyContainer" class="heraldCore-searchManagePartyContainer">
                    <input type="text" id="heraldCore-searchManagePartyInput" class="heraldCore-searchManagePartyInput" placeholder="Search Party...">
                </div>
            </div>
            <div id="heraldCore-managePartyBottomDiv" class="heraldCore-managePartyBottomDiv">
                <div id="heraldCore-buttonAddPartyContainer" class="heraldCore-buttonAddPartyContainer">
                    <button id="heraldCore-buttonAddParty" class="heraldCore-buttonAddParty">Add Party</button>
                </div>
                
            </div>
        </div>`;

    let inputSearch = document.getElementById(
      "heraldCore-searchManagePartyInput"
    );

    let inputSearchTimeOut;
    inputSearch.addEventListener("input", () => {
      clearTimeout(inputSearchTimeOut);

      inputSearchTimeOut = setTimeout(async () => {
        await heraldCore_renderManagePartyMiddleContainer();
      }, 500);
    });

    let buttonAddParty = document.getElementById("heraldCore-buttonAddParty");
    if (buttonAddParty) {
      buttonAddParty.addEventListener("click", async () => {
        await heraldCore_showDialogCreateParty();
      });
    }
  }
}

async function heraldCore_showDialogCreateParty() {
  const content = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div>
        <label><strong>Party Name</strong></label><br>
        <input type="text" id="heraldCore-partyNameInput" style="width: 100%;" placeholder="Enter party name">
      </div>
      <div>
        <label><strong>Description</strong></label><br>
        <textarea id="heraldCore-partyDescInput" rows="4" style="width: 100%;" placeholder="Enter party description"></textarea>
      </div>
    </div>
  `;

  new Dialog({
    title: "Herald Core : Create Party",
    content: content,
    buttons: {
      create: {
        label: "Create Party",
        callback: async (html) => {
          const name = html.find("#heraldCore-partyNameInput").val();
          const desc = html.find("#heraldCore-partyDescInput").val();

          await heraldCore_createFolderJournal(name, desc);
          await heraldCore_renderManagePartyMiddleContainer();
        },
      },
    },
    default: "create",
  }).render(true);
}

async function heraldCore_createFolderJournal(name, desc) {
  let heraldCoreFolder = game.folders.find(
    (f) => f.name === "Herald Core" && f.type === "JournalEntry" && !f.folder
  );

  if (!heraldCoreFolder) {
    heraldCoreFolder = await Folder.create({
      name: "Herald Core",
      type: "JournalEntry",
    });
  }

  let partyFolder = game.folders.find(
    (f) =>
      f.name === "Party" &&
      f.type === "JournalEntry" &&
      f.folder?.id === heraldCoreFolder.id
  );
  if (!partyFolder) {
    partyFolder = await Folder.create({
      name: "Party",
      type: "JournalEntry",
      folder: heraldCoreFolder.id,
    });
  }
  //   let existing = game.journal.find(j => j.name === partyName && j.folder?.id === partyFolder.id);
  //   if (existing) {
  //     ui.notifications.warn("A party with this name already exists.");
  //     return;
  //   }

  await JournalEntry.create({
    name: name,
    folder: partyFolder.id,
    flags: {
      description: desc,
    },
  });
}

async function heraldCore_switchListActorDialogCore() {
  let buttonSwitch = document.getElementById(
    "heraldCore-buttonSwitchListActor"
  );
  let inputSearch = document.getElementById("heraldCore-searchCoreActorInput");
  if (inputSearch) {
    inputSearch.value = "";
  }
  if (heraldCore_switchList == "online") {
    heraldCore_switchList = "all";
    buttonSwitch.textContent = "Show Online Only";
    await heraldCore_renderDialogCoreMiddle(heraldCore_switchList);
  } else {
    heraldCore_switchList = "online";
    buttonSwitch.textContent = "Show All Player";
    await heraldCore_renderDialogCoreMiddle(heraldCore_switchList);
  }
}

export { heraldCore_renderAccessButton };
