interface EventUser {
    email: string;
    name: string;
  }
  
  interface Event {
    name: string;
    date: Date;
  }
  
  export interface EventRegistered {
    user: EventUser;
    event: Event;
  }
  
  export interface EventEmail {
    EmailType: string;
    Recipients: string[];
    Subject: string;
    Data: {
      EventName: string;
      Name: string;
      EventDate: Date;
    };
  }
  