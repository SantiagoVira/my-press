import { Permission } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createStreamSchema } from "../../../shared/schemas/stream";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const streamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createStreamSchema)
    .mutation(async ({ ctx, input }) => {
      // check that a stream with that slug does not already exist
      const streamWithSlug = await ctx.prisma.stream.findUnique({
        where: { slug: input.slug },
      });
      if (streamWithSlug)
        throw new TRPCError({
          code: "CONFLICT",
          message: "A stream with that slug already exists.",
        });

      await ctx.prisma.stream.create({
        data: {
          name: input.name,
          slug: input.slug,
          members: {
            create: {
              userId: ctx.user.id,
              permission: Permission.OWNER,
            },
          },
        },
      });
    }),
});
