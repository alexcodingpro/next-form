'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { FormSchema, formSchema } from '@/schemas/form';
import { FormElementInstance } from '../(dashboard)/_components/FormElements';

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: session.user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionsRate = 0;

  if (visits > 0) {
    submissionsRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionsRate;

  return {
    visits,
    submissions,
    submissionsRate,
    bounceRate,
  };
}

export async function CreateForm(data: FormSchema) {
  const session = await auth();
  const validation = formSchema.safeParse(data);

  if (!validation.success) {
    throw new Error('Invalid form data');
  }

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  const { name, description } = data;

  const form = await prisma.form.create({
    data: {
      userId: session.user.id,
      name,
      description,
    },
  });

  if (!form) {
    throw new Error('Failed to create form');
  }

  return form.id;
}

export async function GetForm() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  const form = await prisma.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return form;
}

export async function GetFormById(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  const form = await prisma.form.findUnique({
    where: {
      userId: session.user.id,
      id,
    },
  });

  return form;
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: session.user.id,
      id,
    },
    data: {
      content: jsonContent,
    },
  });
}

export async function PublishForm(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    data: {
      published: true,
    },
    where: {
      userId: session.user.id,
      id,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.update({
    select: {
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareUrl: formUrl,
    },
  });
}

export async function SubmitForm(formUrl: string, content: string) {
  return await prisma.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmissions: {
        create: {
          content,
        },
      },
    },
    where: {
      shareUrl: formUrl,
      published: true,
    },
  });
}

export async function GetFormSubmissions(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: session.user.id,
      id,
    },
    include: {
      FormSubmissions: true,
    },
  });
}

export async function DeleteForm(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.delete({
    where: {
      userId: session.user.id,
      id,
    },
  });
}

export async function deleteElementInstance(id: number, elementId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UserNotFoundErr();
  }

  const getContent = await prisma.form.findUnique({
    where: {
      userId: session.user.id,
      id,
    },
    select: {
      content: true,
    },
  });

  if (!getContent) return;

  const content = JSON.parse(getContent.content);

  const newContent = content.filter(
    (element: FormElementInstance) => element.id !== elementId
  );

  return await prisma.form.update({
    where: {
      userId: session.user.id,
      id,
    },
    data: {
      content: JSON.stringify(newContent),
    },
  });
}
