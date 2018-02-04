'use strict';
const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// In a bot, a conversation can hold a collection of dialogs.

// Each dialog is designed to be a self-contained unit that can
// perform an action that might take multiple steps, such as collecting
// information from a user or performing an action on her behalf.

const bot = module.exports = new builder.UniversalBot(connector, [
    // this section becomes the root dialog
    // If a conversation hasn't been started, and the message
    // sent by the user doesn't match a pattern, the
    // conversation will start here
    (session, args, next) => {
        session.send(`Hi there! I'm Ogrebot. I exist to help you with your pain.`);
        //session.send(`Let's start the first dialog, which will ask you your name.`);

        // Launch the getName dialog using beginDialog
        // When beginDialog completes, control will be passed
        // to the next function in the waterfall
        session.beginDialog('getName');
    },
    (session, results, next) => {
        // executed when getName dialog completes
        // results parameter contains the object passed into endDialogWithResults

        // check for a response
        if (results.response) {
            const name = session.privateConversationData.name = results.response;

            // When calling another dialog, you can pass arguments in the second parameter
            session.beginDialog('getAge', { name: name });
        } else {
            // no valid response received - End the conversation
            session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
        }
    },
    (session, results, next) => {
        // executed when getAge dialog completes
        // results parameter contains the object passed into endDialogWithResults

        // check for a response
        if (results.response) {
            const age = session.privateConversationData.age = results.response;
            const name = session.privateConversationData.name;

            //session.send(`Hello ${name}. You are ${age}. Let's begin with a few questions.`);
            session.send(`Hello ${name}. Before we go deeper, I would like to ask some basic questions about your back pain.`);

            session.beginDialog('redFlags', {name: name, age: age});

        } else {
            // no valid response received - End the conversation
            session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
        }
    },

    (session, results, next) => {
      session.beginDialog('sensitivityTriage');
    },

    (session, results, next) => {
      session.beginDialog('diagnosticScans');
    },

    (session, results, next) => {
      session.endConversation('Thanks for using Ogrebot! Goodbye.');
    },
]);

bot.dialog('redFlags', [
  (session, args, next) => {
    const name = session.privateConversationData.name;
    builder.Prompts.choice(session, `${name}, Have you recently experienced unexplained weight loss?`, "Yes|No", { listStyle: builder.ListStyle.button });
  },
  (session, results, next) => {
    session.privateConversationData.selection1 = results.response.entity;
    builder.Prompts.choice(session, `Do you have a previous history of cancer?`, "Yes|No", { listStyle: builder.ListStyle.button });
    //session.send(`You chose ${selection1} for Q1.`);
  },
  (session, results, next) => {
    const r1 = session.privateConversationData.selection1;
    const r2 = session.privateConversationData.selection2 = results.response.entity;
    //builder.Prompts.choice(session, `Do you have a previous history of cancer?`, "Yes|No", { listStyle: builder.ListStyle.button });
    if (r1 == 'Yes' || r2 == 'Yes') {
    session.endDialog(`Based on your answers, it sounds like you might have a medical problem that should be looked at by a doctor.`);
  } else {
    session.endDialog('Good! It sounds like your back pain is not due to any serious medical complications. Back pain can hurt a lot and be very troublesome though, even when it isn’t from a serious medical problem. That’s what I want to help you with, so let’s move on!')
  }
  },
]);

bot.dialog('sensitivityTriage', [
  (session, args, next) => {
    const name = session.privateConversationData.name;
    builder.Prompts.choice(session, `Does your pain feel like it is located at a small, easy to point to location on your body? Or does it feel like it’s spread out and difficult to map out exactly?`, "Feels like a point|Spread out", { listStyle: builder.ListStyle.button });
  },
  (session, results, next) => {
    session.privateConversationData.st1 = results.response.entity;
    //const name = session.privateConversationData.name;
    //session.endDialog(`You chose ${session.privateConversationData.st1}`);
    session.endDialog('Done with triage.');
  },

  /*(session, results, next) => {
    session.privateConversationData.selection1 = results.response.entity;
    builder.Prompts.choice(session, `Do you have a previous history of cancer?`, "Yes|No", { listStyle: builder.ListStyle.button });
    //session.send(`You chose ${selection1} for Q1.`);
  },
  (session, results, next) => {
    const r1 = session.privateConversationData.selection1;
    const r2 = session.privateConversationData.selection2 = results.response.entity;
    //builder.Prompts.choice(session, `Do you have a previous history of cancer?`, "Yes|No", { listStyle: builder.ListStyle.button });
    if (r1 == 'Yes' || r2 == 'Yes') {
    session.endDialog(`Based on your answers, it sounds like you might have a medical problem that should be looked at by a doctor.`);
  } else {
    session.endDialog('Good! It sounds like your back pain is not due to any serious medical complications. Back pain can hurt a lot and be very troublesome though, even when it isn’t from a serious medical problem. That’s what I want to help you with, so let’s move on!')
  }
}, */
]);

bot.dialog('diagnosticScans', [
  (session, args, next) => {
    const name = session.privateConversationData.name;
    builder.Prompts.choice(session, `Have you had any diagnostic imaging related to your pain?`, "Yes|No", { listStyle: builder.ListStyle.button });
  },
  (session, results, next) => {
    session.privateConversationData.ds1 = results.response.entity;
    if(session.privateConversationData.ds1 == 'No') {
      session.endDialog("Ok then, let's move on.");
    } else {
      builder.Prompts.choice(session, `Positive findings?`, "Yes|No", { listStyle: builder.ListStyle.button });
    }
    //session.endDialog(`You chose ${session.privateConversationData.st1}`);
    },
 (session, results, next) => {
   session.privateConversationData.ds2 = results.response.entity;
   if (session.privateConversationData.ds2 == 'Yes'){
   builder.Prompts.choice(session, `Did the findings concern you?`, "Yes|No", { listStyle: builder.ListStyle.button });
 } else {
   builder.Prompts.choice(session, `Did the absence of findings concern you?`, "Yes|No", { listStyle: builder.ListStyle.button });
 }
 },

 (session, results, next) => {
   const ds3 = session.privateConversationData.ds3 = results.response.entity;
   if (ds3 == 'Yes'){
   session.endDialog("Here are some resources (1).");
 } else {
   session.endDialog("Here are some resources (2).");
 }
 },
]);
/* bot.dialog('redFlags', [
  (session, args, next) => {
    const name = session.privateConversationData.name;
    builder.Prompts.choice(session, `${name}, Have you recently experienced unexplained weight loss?`, "Yes|No", { listStyle: builder.ListStyle.button });
  },
  (session, results, next) => {
    //const name = session.privateConversationData.name;
    builder.Prompts.choice(session, `Do you have a previous history of cancer?`, "Yes|No", { listStyle: builder.ListStyle.button });
    var selection1 = results.response.entity;
  },
  (session, results, next) => {
    //var selection2 = results.response;
    session.endDialog(`You chose ${selection1}.`);
  },
]);
*/

bot.dialog('getName', [
    (session, args, next) => {
        // store reprompt flag
        if(args) {
            session.dialogData.isReprompt = args.isReprompt;
        }

        // prompt user
        builder.Prompts.text(session, 'What is your name?');
    },
    (session, results, next) => {
        const name = results.response;

        if (!name || name.trim().length < 3) {
            // Bad response. Logic for single re-prompt
            if (session.dialogData.isReprompt) {
                // Re-prompt ocurred
                // Send back empty string
                session.endDialogWithResult({ response: '' });
            } else {
                // Set the flag
                session.send('Sorry, name must be at least 3 characters.');

                // Call replaceDialog to start the dialog over
                // This will replace the active dialog on the stack
                // Send a flag to ensure we only reprompt once
                session.replaceDialog('getName', { isReprompt: true });
            }
        } else {
            // Valid name received
            // Return control to calling dialog
            // Pass the name in the response property of results
            session.endDialogWithResult({ response: name.trim() });
        }
    }
]);

bot.dialog('getAge', [
    (session, args, next) => {
        let name = session.dialogData.name = 'User';

        if (args) {
            // store reprompt flag
            session.dialogData.isReprompt = args.isReprompt;

            // retrieve name
            name = session.dialogData.name = args.name;
        }

        // prompt user
        builder.Prompts.number(session, `How old are you, ${name}?`);
    },
    (session, results, next) => {
        const age = results.response;

        // Basic validation - did we get a response?
        if (!age || age < 13 || age > 90) {
            // Bad response. Logic for single re-prompt
            if (session.dialogData.isReprompt) {
                // Re-prompt ocurred
                // Send back empty string
                session.endDialogWithResult({ response: '' });
            } else {
                // Set the flag
                session.dialogData.didReprompt = true;
                session.send(`Sorry, that doesn't look right.`);
                // Call replaceDialog to start the dialog over
                // This will replace the active dialog on the stack
                session.replaceDialog('getAge',
                    { name: session.dialogData.name, isReprompt: true });
            }
        } else {
            // Valid city received
            // Return control to calling dialog
            // Pass the city in the response property of results
            session.endDialogWithResult({ response: age });
        }
    }
]);
