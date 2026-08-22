import React, { type ReactNode } from 'react';

export const EmailTemplate = ({ url }: {url: string}) => (
  <div>
    <h1>Sign in to our app</h1>
    <p>Click the link below to sign in:</p>
    <a href={url}>{url}</a>
  </div>
) as ReactNode;

