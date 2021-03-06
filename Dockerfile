FROM golang:1.15 as builder

WORKDIR /go/src/github.com/ccycloud/testiculate

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY cmd/ cmd

RUN go build -ldflags="-w -s" cmd/testiculate/testiculate.go

FROM busybox:glibc as production

RUN mkdir -p /testiculate/database && chown -R 1000:1000 /testiculate
WORKDIR /testiculate

USER 1000:1000

COPY --from=builder /go/src/github.com/ccycloud/testiculate/testiculate /usr/bin/testiculate
COPY --from=builder /lib/x86_64-linux-gnu/libdl.so.2 /lib/libdl.so.2
COPY static/ /testiculate/static

CMD ["testiculate"]
